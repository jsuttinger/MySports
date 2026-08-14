import { useEffect, useState } from 'react'
import TeamScoreCard from './TeamScoreCard'
import { sortGames } from '../utils/sortGames'

function GameList({ sport, isToday, isFavorite, pinned, onTogglePin }) {
  const [expandedId, setExpandedId] = useState(null)

  // Switching sport tabs or the selected date should never leave a card
  // from a different list "remembered" as expanded. `sport.url` already
  // encodes both the sport and the date param, so it changes on either.
  useEffect(() => {
    setExpandedId(null)
  }, [sport.url])

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

  function isFavoriteGame(game) {
    return isFavorite(sport.key, game.home.id) || isFavorite(sport.key, game.away.id)
  }

  // A pin only ever elevates a game within today's feed, for the sport it
  // was pinned from.
  const pinnedGameId = isToday && pinned?.sportKey === sport.key ? pinned.gameId : null

  return (
    <div className="game-list">
      {sortGames(sport.games, { isFavoriteGame, pinnedGameId }).map((game) => (
        <TeamScoreCard
          key={game.id}
          game={game}
          sportKey={sport.key}
          expanded={game.id === expandedId}
          onToggle={() => setExpandedId((current) => (current === game.id ? null : game.id))}
          pinned={game.id === pinnedGameId}
          onTogglePin={isToday ? () => onTogglePin(sport.key, game.id) : null}
        />
      ))}
    </div>
  )
}

export default GameList
