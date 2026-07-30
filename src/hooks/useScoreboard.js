import { useEffect, useState } from 'react'
import { fetchScoreboard } from '../services/espnApi'

const REFRESH_INTERVAL_MS = 60000

// Marks each game with when its score last changed (or carries the previous
// mark forward if it didn't), so a component can key a one-shot highlight
// effect off that timestamp without re-flashing on every unrelated refresh.
function tagScoreChanges(games, previousGames) {
  const prevById = new Map((previousGames ?? []).map((game) => [game.id, game]))
  return games.map((game) => {
    const prev = prevById.get(game.id)
    const scoreChanged = prev && (prev.home.score !== game.home.score || prev.away.score !== game.away.score)
    return { ...game, scoreChangedAt: scoreChanged ? Date.now() : (prev?.scoreChangedAt ?? null) }
  })
}

// Fetches and auto-refreshes only the given sport: immediately on mount and
// whenever `sportKey` changes, then every 60s while the browser tab is
// visible. Switching back to a hidden tab triggers an immediate refresh
// instead of waiting out the rest of the interval. Data for previously
// viewed sports is kept around so switching tabs doesn't show a blank
// loading state, and a failed background refresh doesn't wipe out the last
// good data — it just silently keeps showing it.
export function useScoreboard(sportKey) {
  const [dataByKey, setDataByKey] = useState({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await fetchScoreboard(sportKey)
      if (cancelled) return
      setDataByKey((prev) => {
        const existing = prev[sportKey]
        if (result.error && existing && !existing.error) return prev
        const games = tagScoreChanges(result.games, existing?.games)
        return { ...prev, [sportKey]: { ...result, games, lastUpdated: Date.now() } }
      })
    }

    load()
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, REFRESH_INTERVAL_MS)

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [sportKey])

  return dataByKey[sportKey]
}
