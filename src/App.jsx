import { useEffect, useState } from 'react'
import { fetchAllScoreboards } from './services/espnApi'

function formatStartTime(iso) {
  if (!iso) return 'Unknown time'
  return new Date(iso).toLocaleString()
}

function GameRow({ game }) {
  return (
    <li>
      {game.away.name} ({game.away.score ?? '-'}) @ {game.home.name} ({game.home.score ?? '-'})
      {' — '}
      status: {game.status} ({game.statusDetail}){' — '}
      starts: {formatStartTime(game.startTime)}
    </li>
  )
}

function SportSection({ sport }) {
  return (
    <div>
      <h2>{sport.label}</h2>
      {sport.error && (
        <p>
          ERROR fetching {sport.label}: {sport.error} (see browser console for full details)
        </p>
      )}
      {!sport.error && sport.games.length === 0 && <p>No games found.</p>}
      {!sport.error && sport.games.length > 0 && (
        <ul>
          {sport.games.map((game) => (
            <GameRow key={game.id} game={game} />
          ))}
        </ul>
      )}
    </div>
  )
}

function App() {
  const [sportsData, setSportsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllScoreboards().then((results) => {
      setSportsData(results)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h1>MySports — Live Score Fetch Test</h1>
      <p>Fetching directly from ESPN's public scoreboard endpoints, no backend proxy.</p>
      {loading && <p>Loading...</p>}
      {sportsData && sportsData.map((sport) => <SportSection key={sport.key} sport={sport} />)}
    </div>
  )
}

export default App
