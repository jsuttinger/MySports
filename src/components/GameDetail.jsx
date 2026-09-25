import MlbGameDetail from './MlbGameDetail'
import FootballGameDetail from './FootballGameDetail'
import GenericGameDetail from './GenericGameDetail'

// Sport-aware dispatcher: add a case here (and a matching component) to
// build out a real detail view for another sport later. `lastUpdated` is the
// main scoreboard's last-refresh timestamp (see useScoreboard) -- passed
// through so each detail view can refetch its own data (box score, scoring
// plays, etc) in lockstep with the main feed instead of running on its own
// disconnected timer.
function GameDetail({ sportKey, game, expanded, lastUpdated }) {
  if (sportKey === 'mlb') return <MlbGameDetail game={game} expanded={expanded} lastUpdated={lastUpdated} />
  if (sportKey === 'nfl' || sportKey === 'ncaaf') {
    return <FootballGameDetail sportKey={sportKey} game={game} expanded={expanded} lastUpdated={lastUpdated} />
  }
  return <GenericGameDetail game={game} sportKey={sportKey} expanded={expanded} lastUpdated={lastUpdated} />
}

export default GameDetail
