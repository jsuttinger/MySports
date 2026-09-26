import { useEffect, useRef, useState } from 'react'
import DetailRow from './DetailRow'
import ScoringSummary from './ScoringSummary'
import { fetchScoringPlays } from '../services/espnApi'

// Sports with a real scoring-play feed available (see espnApi.fetchScoringPlays).
// Others just get the generic record/situation info below.
const SCORING_SUMMARY_EMPTY_MESSAGE = {
  nhl: 'No goals scored yet.',
}

// Placeholder detail view for sports without a full dedicated one yet. NHL
// gets a real Scoring Summary (fetched on expand); everything else here
// just surfaces data the shared espnApi parser already extracts for every
// sport — no other sport-specific parsing added here. NFL, NCAAF, and MLB
// have their own dedicated detail components (FootballGameDetail,
// MlbGameDetail).
// Team records are already shown inline under each team's name in the card
// header (visible whether or not this is expanded), so they aren't repeated
// here.
function GenericGameDetail({ game, sportKey, expanded, lastUpdated }) {
  const hasLastPlay = Boolean(game.situation?.lastPlay)
  const hasPossession = Boolean(game.situation?.downDistance)

  const supportsScoringSummary = Boolean(SCORING_SUMMARY_EMPTY_MESSAGE[sportKey]) && game.status !== 'scheduled'

  const [plays, setPlays] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const hasLoadedRef = useRef(false)

  // Same pattern as MlbGameDetail: fetch once on expand, then keep
  // refetching whenever `lastUpdated` changes -- i.e. every time the main
  // feed itself refreshes (its own 60s timer, the tab/app regaining
  // visibility, or a manual pull-to-refresh/refresh-button tap) -- for as
  // long as this card is expanded and the game is still live, so new
  // scoring plays show up without collapsing/reopening the card.
  useEffect(() => {
    if (!supportsScoringSummary || !expanded) return

    let cancelled = false

    function load() {
      if (!hasLoadedRef.current) setLoading(true)
      fetchScoringPlays(sportKey, game.id)
        .then((result) => {
          if (cancelled) return
          hasLoadedRef.current = true
          setPlays(result)
          setError(null)
        })
        .catch((err) => {
          if (cancelled) return
          console.error(`[Scoreboard] Failed to fetch scoring plays for event ${game.id}`, err)
          if (!hasLoadedRef.current) setError(err.message ?? String(err))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()

    return () => {
      cancelled = true
    }
  }, [
    supportsScoringSummary,
    expanded,
    sportKey,
    game.id,
    game.status,
    game.status === 'live' ? lastUpdated : null,
  ])

  const hasOtherInfo = hasPossession || hasLastPlay

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
      {supportsScoringSummary && (
        <ScoringSummary
          loading={loading}
          error={error}
          plays={plays}
          emptyMessage={SCORING_SUMMARY_EMPTY_MESSAGE[sportKey]}
        />
      )}
      {!hasOtherInfo && !supportsScoringSummary && (
        <p className="game-detail__placeholder">More detail for this sport is coming soon.</p>
      )}
    </div>
  )
}

export default GenericGameDetail
