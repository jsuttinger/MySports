// Fetches live scoreboard data directly from ESPN's public (undocumented) site API.
// Called straight from the browser — no backend proxy. If ESPN's CORS
// headers don't allow browser requests, fetch() will reject and we log+surface
// the raw error instead of swallowing it, so it can be diagnosed.

export const SPORTS = [
  {
    key: 'nfl',
    label: 'NFL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  },
  {
    key: 'nba',
    label: 'NBA',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  },
  {
    key: 'mlb',
    label: 'MLB',
    url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  },
  {
    key: 'nhl',
    label: 'NHL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  },
  {
    key: 'epl',
    label: 'Premier League',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  },
]

// ESPN's `status.type.state` is one of: 'pre' | 'in' | 'post'.
function normalizeStatus(state) {
  if (state === 'pre') return 'scheduled'
  if (state === 'in') return 'live'
  if (state === 'post') return 'final'
  return state ?? 'unknown'
}

function parseTeam(competitor) {
  const team = competitor?.team ?? {}
  const record = competitor?.records?.find((r) => r.type === 'total')?.summary ?? null
  const probablePitcher =
    competitor?.probables?.find((p) => p.name === 'probableStartingPitcher')?.athlete?.fullName ?? null

  return {
    name: team.displayName ?? team.name ?? 'Unknown',
    abbreviation: team.abbreviation ?? '',
    score: competitor?.score ?? null,
    homeAway: competitor?.homeAway ?? null,
    winner: competitor?.winner ?? false,
    logo: team.logo ?? team.logos?.[0]?.href ?? null,
    color: team.color ? `#${team.color}` : null,
    alternateColor: team.alternateColor ? `#${team.alternateColor}` : null,
    record,
    hits: competitor?.hits ?? null,
    errors: competitor?.errors ?? null,
    linescores: (competitor?.linescores ?? []).map((ls) => ({ period: ls.period, display: ls.displayValue })),
    probablePitcher,
  }
}

// ESPN marks the favored side with awayTeamOdds.favorite / homeTeamOdds.favorite
// booleans and gives an unsigned spread magnitude — more reliable than parsing
// the free-text `details` string (e.g. "CAR -1.5"), which we still keep as a
// fallback for whenever the structured fields don't clearly identify a
// favorite (e.g. a pick'em, or a sport/provider that omits them).
function parseOdds(competition) {
  const odds = competition?.odds?.[0]
  if (!odds) return null

  const favoriteSide = odds.awayTeamOdds?.favorite ? 'away' : odds.homeTeamOdds?.favorite ? 'home' : null

  return {
    provider: odds.provider?.name ?? null,
    spreadDetails: odds.details ?? null,
    spreadValue: typeof odds.spread === 'number' ? Math.abs(odds.spread) : null,
    favoriteSide,
    overUnder: odds.overUnder ?? null,
  }
}

const DOWN_NAMES = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }

function parseAthleteAtBat(entry) {
  if (!entry?.athlete) return null
  return {
    name: entry.athlete.fullName ?? entry.athlete.displayName ?? null,
    summary: entry.summary ?? null,
  }
}

// The live "situation" object varies by sport: baseball has balls/strikes/outs,
// base runners, and the current batter/pitcher; football has down/distance/
// possession. Everything here is optional — a sport that doesn't provide a
// field just won't render it.
function parseSituation(competition) {
  const situation = competition?.situation
  if (!situation) return null

  const downDistance =
    situation.shortDownDistanceText ??
    situation.downDistanceText ??
    (situation.down && situation.distance
      ? `${DOWN_NAMES[situation.down] ?? situation.down} & ${situation.distance}`
      : null)

  return {
    lastPlay: situation.lastPlay?.text ?? null,
    downDistance,
    possession: situation.possessionText ?? null,
    balls: situation.balls ?? null,
    strikes: situation.strikes ?? null,
    outs: situation.outs ?? null,
    onFirst: situation.onFirst ?? false,
    onSecond: situation.onSecond ?? false,
    onThird: situation.onThird ?? false,
    batter: parseAthleteAtBat(situation.batter),
    pitcher: parseAthleteAtBat(situation.pitcher),
  }
}

function parseEvent(event) {
  const competition = event.competitions?.[0]
  const competitors = competition?.competitors ?? []
  const home = competitors.find((c) => c.homeAway === 'home')
  const away = competitors.find((c) => c.homeAway === 'away')
  const statusType = event.status?.type ?? {}

  return {
    id: event.id,
    name: event.shortName ?? event.name,
    startTime: event.date,
    status: normalizeStatus(statusType.state),
    statusDetail: statusType.shortDetail ?? statusType.detail ?? statusType.description ?? '',
    home: parseTeam(home),
    away: parseTeam(away),
    odds: parseOdds(competition),
    situation: parseSituation(competition),
  }
}

function parseScoreboard(json) {
  return (json.events ?? []).map(parseEvent)
}

async function fetchSportScoreboard({ key, label, url: baseUrl }, dateParam) {
  // ESPN's scoreboard defaults to whatever IT considers "today" when no
  // `dates` param is given — this can lag a full day behind the user's
  // actual local date (observed: ESPN serving yesterday's slate mid-day).
  // Always pass an explicit date so "today" means the user's local today.
  const url = dateParam ? `${baseUrl}?dates=${dateParam}` : baseUrl
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }
    const json = await response.json()
    return { key, label, url, dateParam, games: parseScoreboard(json), error: null }
  } catch (err) {
    // Surface the exact error (e.g. a CORS failure will show as a TypeError:
    // "Failed to fetch" here, with the real reason only visible in devtools).
    console.error(`[MySports] Failed to fetch ${label} scoreboard from ${url}`, err)
    return { key, label, url, dateParam, games: [], error: err.message ?? String(err) }
  }
}

// Fetches a single sport's scoreboard by key and local date (YYYYMMDD), for
// the active-tab-only refresh loop (no point re-fetching sports/dates the
// user isn't looking at).
export async function fetchScoreboard(key, dateParam) {
  const sport = SPORTS.find((s) => s.key === key)
  if (!sport) throw new Error(`Unknown sport: ${key}`)
  return fetchSportScoreboard(sport, dateParam)
}

const MLB_SUMMARY_URL = 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary'

// ESPN's boxscore stat rows are keyed by human-readable label (e.g. "AB",
// "ERA") rather than fixed positions, so pull values out by label name —
// robust to ESPN reordering or adding columns.
function parseBoxScoreCategory(category) {
  const labels = category?.labels ?? []
  return (category?.athletes ?? []).map((entry) => {
    const stats = {}
    labels.forEach((label, i) => {
      stats[label] = entry.stats?.[i] ?? null
    })
    return { name: entry.athlete?.shortName ?? entry.athlete?.displayName ?? 'Unknown', stats }
  })
}

function parseBoxScoreTeam(teamEntry) {
  const batting = teamEntry.statistics?.find((s) => s.type === 'batting')
  const pitching = teamEntry.statistics?.find((s) => s.type === 'pitching')
  return {
    abbreviation: teamEntry.team?.abbreviation ?? '',
    batting: parseBoxScoreCategory(batting),
    pitching: parseBoxScoreCategory(pitching),
  }
}

// Full player-level box score for one MLB game, fetched lazily (only when
// the user actually opens it) from ESPN's per-event summary endpoint —
// the scoreboard endpoint only has team-level totals, not per-player lines.
export async function fetchMlbBoxScore(eventId) {
  const response = await fetch(`${MLB_SUMMARY_URL}?event=${eventId}`)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  const json = await response.json()
  const teams = json.boxscore?.players ?? []
  return teams.map(parseBoxScoreTeam)
}
