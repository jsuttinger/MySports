import TeamScoreCard from './TeamScoreCard'
import { sortGames } from '../utils/sortGames'

function GameList({ sport }) {
  if (sport.error) {
    return (
      <p className="state-message state-message--error">
        ERROR fetching {sport.label}: {sport.error} (see browser console for full details)
      </p>
    )
  }

  if (sport.games.length === 0) {
    return <p className="state-message">No games found.</p>
  }

  return (
    <div className="game-list">
      {sortGames(sport.games).map((game) => (
        <TeamScoreCard key={game.id} game={game} />
      ))}
    </div>
  )
}

export default GameList
