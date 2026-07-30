import { useEffect, useRef, useState } from 'react'
import BaseDiamond from './BaseDiamond'
import Chevron from './Chevron'
import DetailRow from './DetailRow'
import { fetchMlbGameSummary } from '../services/espnApi'

const BATTING_COLUMNS = ['AB', 'R', 'H', 'RBI', 'BB', 'K']
const PITCHING_COLUMNS = ['IP', 'H', 'R', 'ER', 'BB', 'K', 'ERA']

function BoxScore({ away, home }) {
  const periods = Math.max(away.linescores.length, home.linescores.length)
  const hasInnings = periods > 0

  function cellsFor(team) {
    const byPeriod = new Map(team.linescores.map((ls) => [ls.period, ls.display]))
    return Array.from({ length: periods }, (_, i) => byPeriod.get(i + 1) ?? '-')
  }

  return (
    <table className="box-score">
      <thead>
        <tr>
          <th></th>
          {hasInnings && Array.from({ length: periods }, (_, i) => <th key={i}>{i + 1}</th>)}
          <th>R</th>
          <th>H</th>
          <th>E</th>
        </tr>
      </thead>
      <tbody>
        {[away, home].map((team) => (
          <tr key={team.abbreviation}>
            <td className="box-score__team">{team.abbreviation}</td>
            {hasInnings && cellsFor(team).map((value, i) => <td key={i}>{value}</td>)}
            <td>{team.score ?? '-'}</td>
            <td>{team.hits ?? '-'}</td>
            <td>{team.errors ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AtBat({ situation }) {
  if (!situation) return null

  return (
    <div className="at-bat">
      {situation.pitcher?.name && (
        <DetailRow
          label="Pitching"
          value={situation.pitcher.summary ? `${situation.pitcher.name} — ${situation.pitcher.summary}` : situation.pitcher.name}
        />
      )}
      {situation.batter?.name && (
        <DetailRow
          label="At bat"
          value={situation.batter.summary ? `${situation.batter.name} — ${situation.batter.summary}` : situation.batter.name}
        />
      )}
      <div className="at-bat__count-row">
        <span className="live-detail__tag">
          {situation.balls}-{situation.strikes}, {situation.outs ?? 0} out{situation.outs === 1 ? '' : 's'}
        </span>
        <BaseDiamond
          size="large"
          onFirst={situation.onFirst}
          onSecond={situation.onSecond}
          onThird={situation.onThird}
        />
      </div>
      {situation.lastPlay && <p className="game-detail__note">{situation.lastPlay}</p>}
    </div>
  )
}

function ScheduledInfo({ game }) {
  const hasProbables = game.away.probablePitcher || game.home.probablePitcher
  const hasRecords = game.away.record || game.home.record

  return (
    <>
      {hasProbables && (
        <>
          <DetailRow label={`${game.away.abbreviation} probable`} value={game.away.probablePitcher ?? 'TBD'} />
          <DetailRow label={`${game.home.abbreviation} probable`} value={game.home.probablePitcher ?? 'TBD'} />
        </>
      )}
      {hasRecords && (
        <DetailRow
          label="Record"
          value={`${game.away.abbreviation} ${game.away.record ?? '—'}   ·   ${game.home.abbreviation} ${game.home.record ?? '—'}`}
        />
      )}
      {!hasProbables && !hasRecords && <p className="game-detail__placeholder">No additional info yet.</p>}
    </>
  )
}

// Visible by default (not behind a toggle) whenever the card is expanded —
// unlike the full box score, which stays opt-in behind its own button.
function ScoringSummary({ loading, error, plays }) {
  return (
    <div className="scoring-summary">
      <h4 className="section-heading">Scoring Summary</h4>
      {loading && <p className="game-detail__placeholder">Loading scoring plays…</p>}
      {error && <p className="state-message--error">Couldn't load scoring plays.</p>}
      {!loading && !error && (!plays || plays.length === 0) && (
        <p className="game-detail__placeholder">No runs scored yet.</p>
      )}
      {!loading && !error && plays && plays.length > 0 && (
        <div className="scoring-summary__list">
          {plays.map((play) => (
            <DetailRow key={play.id} label={play.inningLabel} value={play.text} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatTable({ title, rows, columns }) {
  if (!rows || rows.length === 0) return null

  return (
    <div className="full-box__section">
      <h4 className="section-heading">{title}</h4>
      <div className="full-box__table-wrap">
        <table className="full-box__table">
          <thead>
            <tr>
              <th className="full-box__name-col"></th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="full-box__name-col">{row.name}</td>
                {columns.map((col) => (
                  <td key={col}>{row.stats[col] ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FullBoxScore({ teams }) {
  return (
    <div className="full-box">
      {teams.map((team) => (
        <div key={team.abbreviation} className="full-box__team">
          <div className="full-box__team-name">{team.abbreviation}</div>
          <StatTable title="Batting" rows={team.batting} columns={BATTING_COLUMNS} />
          <StatTable title="Pitching" rows={team.pitching} columns={PITCHING_COLUMNS} />
        </div>
      ))}
    </div>
  )
}

// Purely presentational now — the box score data is fetched once by the
// parent (alongside the scoring plays) as soon as the card expands, so
// opening this just reveals/hides what's already there.
function FullBoxScoreToggle({ teams, loading, error }) {
  const [open, setOpen] = useState(false)

  function handleClick(event) {
    // Don't let this bubble up to the card's own tap-to-collapse handler.
    event.stopPropagation()
    setOpen((current) => !current)
  }

  return (
    <div className="full-box-toggle">
      <button type="button" className="full-box-toggle__button" onClick={handleClick} aria-expanded={open}>
        {open ? 'Hide Full Box Score' : 'Full Box Score'}
        <Chevron expanded={open} />
      </button>
      {open && (
        <div className="full-box-toggle__content">
          {loading && <p className="game-detail__placeholder">Loading full box score…</p>}
          {error && <p className="state-message--error">Couldn't load box score: {error}</p>}
          {teams && <FullBoxScore teams={teams} />}
        </div>
      )}
    </div>
  )
}

function MlbGameDetail({ game, expanded }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchedRef = useRef(false)

  // Fetch once, the first time the card is actually expanded — not on
  // mount (the detail view stays mounted even while collapsed for the
  // expand/collapse CSS animation) and not on scheduled games, which have
  // no plays or box score yet.
  useEffect(() => {
    if (!expanded || fetchedRef.current || game.status === 'scheduled') return
    fetchedRef.current = true
    setLoading(true)
    fetchMlbGameSummary(game.id)
      .then(setSummary)
      .catch((err) => {
        console.error(`[MySports] Failed to fetch game summary for event ${game.id}`, err)
        setError(err.message ?? String(err))
      })
      .finally(() => setLoading(false))
  }, [expanded, game.id, game.status])

  if (game.status === 'scheduled') {
    return (
      <div className="game-detail">
        <ScheduledInfo game={game} />
      </div>
    )
  }

  return (
    <div className="game-detail">
      <BoxScore away={game.away} home={game.home} />
      {game.status === 'live' && <AtBat situation={game.situation} />}
      <ScoringSummary loading={loading} error={error} plays={summary?.scoringPlays} />
      <FullBoxScoreToggle teams={summary?.boxScore} loading={loading} error={error} />
    </div>
  )
}

export default MlbGameDetail
