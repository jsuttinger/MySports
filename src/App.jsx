import { useEffect, useState } from 'react'
import { SPORTS } from './services/espnApi'
import { useScoreboard } from './hooks/useScoreboard'
import { todayParam } from './utils/date'
import DateStrip from './components/DateStrip'
import GameList from './components/GameList'
import LastUpdated from './components/LastUpdated'
import BottomTabBar from './components/BottomTabBar'
import PullToRefresh from './components/PullToRefresh'

function App() {
  const [activeSport, setActiveSport] = useState(SPORTS[0].key)
  const [today, setToday] = useState(() => todayParam())
  const [selectedDate, setSelectedDate] = useState(today)

  // The calendar day can roll over while the app is open (backgrounded
  // overnight, or just left open past midnight). Re-check on every return
  // to the tab and on a slow interval so "today" never goes stale — if the
  // user was viewing today (hadn't manually picked another date), silently
  // follow it forward to the new today; a manually-picked date is left
  // alone.
  useEffect(() => {
    function checkToday() {
      const fresh = todayParam()
      setToday((prevToday) => {
        if (fresh === prevToday) return prevToday
        setSelectedDate((prevSelected) => (prevSelected === prevToday ? fresh : prevSelected))
        return fresh
      })
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') checkToday()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') checkToday()
    }, 60000)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(intervalId)
    }
  }, [])

  const { sportData, refresh } = useScoreboard(activeSport, selectedDate)

  return (
    <div className="app app--bottom-nav">
      <PullToRefresh onRefresh={refresh}>
        <header className="app-header">
          <h1>MySports</h1>
        </header>

        <DateStrip selectedDate={selectedDate} today={today} onSelect={setSelectedDate} />

        <LastUpdated timestamp={sportData?.lastUpdated} />

        <main>
          {!sportData && <p className="state-message">Loading scores…</p>}
          {sportData && <GameList sport={sportData} />}
        </main>
      </PullToRefresh>

      <BottomTabBar sports={SPORTS} activeSport={activeSport} onSelect={setActiveSport} />
    </div>
  )
}

export default App
