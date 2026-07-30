import MlbGameDetail from './MlbGameDetail'
import GenericGameDetail from './GenericGameDetail'

// Sport-aware dispatcher: add a case here (and a matching component) to
// build out a real detail view for another sport later.
function GameDetail({ sportKey, game, expanded }) {
  if (sportKey === 'mlb') return <MlbGameDetail game={game} expanded={expanded} />
  return <GenericGameDetail game={game} sportKey={sportKey} expanded={expanded} />
}

export default GameDetail
