import DetailRow from './DetailRow'

// Placeholder detail view for sports without a dedicated one yet (NFL, NBA,
// NHL, soccer). Only surfaces data the shared espnApi parser already
// extracts for every sport — no sport-specific parsing added here.
function GenericGameDetail({ game }) {
  const hasRecords = game.away.record || game.home.record
  const hasLastPlay = Boolean(game.situation?.lastPlay)
  const hasPossession = Boolean(game.situation?.downDistance)

  return (
    <div className="game-detail">
      {hasRecords && (
        <DetailRow
          label="Record"
          value={`${game.away.abbreviation} ${game.away.record ?? '—'}   ·   ${game.home.abbreviation} ${game.home.record ?? '—'}`}
        />
      )}
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
      {!hasRecords && !hasPossession && !hasLastPlay && (
        <p className="game-detail__placeholder">More detail for this sport is coming soon.</p>
      )}
    </div>
  )
}

export default GenericGameDetail
