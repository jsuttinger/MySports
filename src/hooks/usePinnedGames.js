import { useCallback, useEffect, useState } from 'react'
import { todayParam } from '../utils/date'

const STORAGE_KEY = 'mysports:pinnedGames'

function pinKey(sportKey, gameId) {
  return `${sportKey}:${gameId}`
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: todayParam(), keys: new Set() }
    const parsed = JSON.parse(raw)
    // Pins only ever apply to the day they were made on -- if that's not
    // today anymore (app reopened on a later day), none of them happened.
    if (!parsed || parsed.date !== todayParam()) return { date: todayParam(), keys: new Set() }
    return { date: parsed.date, keys: new Set(parsed.keys ?? []) }
  } catch {
    return { date: todayParam(), keys: new Set() }
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: state.date, keys: [...state.keys] }))
  } catch {
    // ignore
  }
}

// Any number of pinned games, scoped to a single day -- backed by
// localStorage but dropped automatically once the calendar day rolls over.
// `today` is the same midnight-rollover-aware value App.jsx already tracks,
// so both go stale together instead of drifting apart.
export function usePinnedGames(today) {
  const [state, setState] = useState(load)

  useEffect(() => {
    setState((current) => {
      if (current.date !== today) {
        const next = { date: today, keys: new Set() }
        persist(next)
        return next
      }
      return current
    })
  }, [today])

  const togglePin = useCallback((sportKey, gameId) => {
    setState((current) => {
      const key = pinKey(sportKey, gameId)
      const nextKeys = new Set(current.keys)
      if (nextKeys.has(key)) nextKeys.delete(key)
      else nextKeys.add(key)
      const next = { date: todayParam(), keys: nextKeys }
      persist(next)
      return next
    })
  }, [])

  const isPinned = useCallback((sportKey, gameId) => state.keys.has(pinKey(sportKey, gameId)), [state])

  return { isPinned, togglePin }
}
