import { useEffect, useState } from 'react'
import TeamScoreCard from './TeamScoreCard'
import { sortGames } from '../utils/sortGames'

function GameList({ sport }) {
  const [expandedId, setExpandedId] = useState(null)

  // Switching sport tabs should never leave a card from a different sport
  // "remembered" as expanded.
  useEffect(() => {
    setExpandedId(null)
  }, [sport.key])

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
        <TeamScoreCard
          key={game.id}
          game={game}
          sportKey={sport.key}
          expanded={game.id === expandedId}
          onToggle={() => setExpandedId((current) => (current === game.id ? null : game.id))}
        />
      ))}
    </div>
  )
}

export default GameList
