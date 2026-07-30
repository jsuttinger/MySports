import { useEffect, useMemo, useState } from 'react'
import { fetchAllScoreboards, SPORTS } from './services/espnApi'
import SportTab from './components/SportTab'
import GameList from './components/GameList'

function App() {
  const [sportsData, setSportsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSport, setActiveSport] = useState(SPORTS[0].key)

  useEffect(() => {
    fetchAllScoreboards().then((results) => {
      setSportsData(results)
      setLoading(false)
    })
  }, [])

  const activeSportData = useMemo(
    () => sportsData?.find((sport) => sport.key === activeSport) ?? null,
    [sportsData, activeSport],
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>MySports</h1>
      </header>

      <nav className="sport-tabs">
        {SPORTS.map((sport) => (
          <SportTab
            key={sport.key}
            label={sport.label}
            active={sport.key === activeSport}
            onClick={() => setActiveSport(sport.key)}
          />
        ))}
      </nav>

      <main>
        {loading && <p className="state-message">Loading scores…</p>}
        {activeSportData && <GameList sport={activeSportData} />}
      </main>
    </div>
  )
}

export default App
