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
  return {
    name: team.displayName ?? team.name ?? 'Unknown',
    abbreviation: team.abbreviation ?? '',
    score: competitor?.score ?? null,
    homeAway: competitor?.homeAway ?? null,
    winner: competitor?.winner ?? false,
    logo: team.logo ?? team.logos?.[0]?.href ?? null,
    color: team.color ? `#${team.color}` : null,
    alternateColor: team.alternateColor ? `#${team.alternateColor}` : null,
  }
}

function parseOdds(competition) {
  const odds = competition?.odds?.[0]
  if (!odds) return null
  return {
    provider: odds.provider?.name ?? null,
    spreadDetails: odds.details ?? null,
    overUnder: odds.overUnder ?? null,
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
  }
}

function parseScoreboard(json) {
  return (json.events ?? []).map(parseEvent)
}

async function fetchSportScoreboard({ key, label, url }) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }
    const json = await response.json()
    return { key, label, url, games: parseScoreboard(json), error: null }
  } catch (err) {
    // Surface the exact error (e.g. a CORS failure will show as a TypeError:
    // "Failed to fetch" here, with the real reason only visible in devtools).
    console.error(`[MySports] Failed to fetch ${label} scoreboard from ${url}`, err)
    return { key, label, url, games: [], error: err.message ?? String(err) }
  }
}

// Fetches all configured sports concurrently. Each sport is isolated so one
// failing request (e.g. CORS) doesn't prevent the others from rendering.
export async function fetchAllScoreboards() {
  return Promise.all(SPORTS.map(fetchSportScoreboard))
}
