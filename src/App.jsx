import { useState } from 'react'
import { SPORTS } from './services/espnApi'
import { useScoreboard } from './hooks/useScoreboard'
import SportTab from './components/SportTab'
import GameList from './components/GameList'
import LastUpdated from './components/LastUpdated'

function App() {
  const [activeSport, setActiveSport] = useState(SPORTS[0].key)
  const sportData = useScoreboard(activeSport)

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

      <LastUpdated timestamp={sportData?.lastUpdated} />

      <main>
        {!sportData && <p className="state-message">Loading scores…</p>}
        {sportData && <GameList sport={sportData} />}
      </main>
    </div>
  )
}

export default App
