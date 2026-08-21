import { useEffect, useRef, useState } from 'react'
import Chevron from './Chevron'
import DetailRow from './DetailRow'
import ScoringSummary from './ScoringSummary'
import { fetchNflGameSummary } from '../services/espnApi'
import { REFRESH_INTERVAL_MS } from '../hooks/useScoreboard'

function StatTable({ category }) {
  const { title, labels, rows } = category

  return (
    <div className="full-box__section">
      <h4 className="section-heading">{title}</h4>
      <div className="full-box__table-wrap">
        <table className="full-box__table">
          <thead>
            <tr>
              <th className="full-box__name-col"></th>
              {labels.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="full-box__name-col">{row.name}</td>
                {labels.map((col) => (
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
          {team.categories.map((category) => (
            <StatTable key={category.key} category={category} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Same collapsible pattern as MLB's Full Box Score: purely presentational,
// hidden by default, revealing whatever the parent has already fetched.
function FullBoxScoreToggle({ teams, loading, error }) {
  const [open, setOpen] = useState(false)
  const hasStats = teams?.some((team) => team.categories.length > 0)

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
          {!loading && !error && !hasStats && <p className="game-detail__placeholder">Not available yet.</p>}
          {hasStats && <FullBoxScore teams={teams} />}
        </div>
      )}
    </div>
  )
}

function NflGameDetail({ game, expanded }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const hasLoadedRef = useRef(false)

  // Same pattern as MlbGameDetail: fetch once the card is actually expanded
  // (not scheduled games, which have nothing yet), then keep refetching on
  // the main feed's cadence for as long as the card stays expanded and the
  // game is still live. A background refresh doesn't reset the loading
  // spinner or blank out data already on screen over one failed poll.
  useEffect(() => {
    if (!expanded || game.status === 'scheduled') return

    let cancelled = false

    function load() {
      if (!hasLoadedRef.current) setLoading(true)
      fetchNflGameSummary(game.id)
        .then((result) => {
          if (cancelled) return
          hasLoadedRef.current = true
          setSummary(result)
          setError(null)
        })
        .catch((err) => {
          if (cancelled) return
          console.error(`[MySports] Failed to fetch NFL game summary for event ${game.id}`, err)
          if (!hasLoadedRef.current) setError(err.message ?? String(err))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()

    if (game.status !== 'live') {
      return () => {
        cancelled = true
      }
    }

    const intervalId = setInterval(load, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [expanded, game.id, game.status])

  const hasLastPlay = Boolean(game.situation?.lastPlay)
  const hasPossession = Boolean(game.situation?.downDistance)

  if (game.status === 'scheduled') {
    return (
      <div className="game-detail">
        <p className="game-detail__placeholder">No additional info yet.</p>
      </div>
    )
  }

  return (
    <div className="game-detail">
      {hasPossession && (
        <DetailRow
          label="Situation"
          value={
            game.situation.possession
              ? `${game.situation.downDistance} — ${game.situation.possession} ball`
              : game.situation.downDistance
          }
        />
      )}
      {hasLastPlay && <p className="game-detail__note">{game.situation.lastPlay}</p>}
      <ScoringSummary
        loading={loading}
        error={error}
        plays={summary?.scoringPlays}
        emptyMessage="No scoring yet."
      />
      <FullBoxScoreToggle teams={summary?.boxScore} loading={loading} error={error} />
    </div>
  )
}

export default NflGameDetail
