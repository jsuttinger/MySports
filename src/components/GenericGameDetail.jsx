import DetailRow from './DetailRow'

// Placeholder detail view for a sport without a dedicated one yet.
// Currently unreachable -- NFL, NCAAF, MLB, and NHL all have their own
// dedicated detail components (FootballGameDetail, MlbGameDetail,
// NhlGameDetail) -- kept as GameDetail's fallback for any future sport added
// to SPORTS before it gets its own detail view. Just surfaces whatever the
// shared espnApi parser already extracts generically (last play, down and
// distance). Team records are already shown inline under each team's name in
// the card header (visible whether or not this is expanded), so they aren't
// repeated here.
function GenericGameDetail({ game }) {
  const hasLastPlay = Boolean(game.situation?.lastPlay)
  const hasPossession = Boolean(game.situation?.downDistance)
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
      {!hasOtherInfo && <p className="game-detail__placeholder">More detail for this sport is coming soon.</p>}
    </div>
  )
}

export default GenericGameDetail
