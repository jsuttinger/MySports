import { useCallback, useEffect, useState } from 'react'
import { fetchScoreboard } from '../services/espnApi'
import { todayParam } from '../utils/date'

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

// Fetches and auto-refreshes the given sport + local date (YYYYMMDD):
// immediately on mount and whenever either changes, then every 60s while the
// browser tab is visible -- but only when `dateParam` is actually today,
// re-checked fresh at each tick (not captured once) so a tab left open
// across midnight stops "refreshing" a day that's no longer today. Data for
// previously viewed sport/date pairs is kept around so switching doesn't
// show a blank loading state, and a failed background refresh doesn't wipe
// out the last good data -- it just silently keeps showing it.
//
// `refresh` is the same fetch, exposed so callers (e.g. pull-to-refresh) can
// trigger one on demand and await its completion.
export function useScoreboard(sportKey, dateParam) {
  const [dataByKey, setDataByKey] = useState({})
  const cacheKey = `${sportKey}|${dateParam}`

  const refresh = useCallback(async () => {
    const result = await fetchScoreboard(sportKey, dateParam)
    setDataByKey((prev) => {
      const existing = prev[cacheKey]
      if (result.error && existing && !existing.error) return prev
      const games = tagScoreChanges(result.games, existing?.games)
      return { ...prev, [cacheKey]: { ...result, games, lastUpdated: Date.now() } }
    })
  }, [sportKey, dateParam, cacheKey])

  useEffect(() => {
    refresh()

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && dateParam === todayParam()) refresh()
    }, REFRESH_INTERVAL_MS)

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && dateParam === todayParam()) refresh()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refresh, dateParam])

  return { sportData: dataByKey[cacheKey], refresh }
}
