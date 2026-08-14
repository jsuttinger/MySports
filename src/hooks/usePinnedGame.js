import { useCallback, useEffect, useState } from 'react'
import { todayParam } from '../utils/date'

const STORAGE_KEY = 'mysports:pinnedGame'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // A pin only ever applies to the day it was made on -- if that's not
    // today anymore (app reopened on a later day), it never happened.
    if (!parsed || parsed.date !== todayParam()) return null
    return parsed
  } catch {
    return null
  }
}

function persist(pinned) {
  try {
    if (pinned) localStorage.setItem(STORAGE_KEY, JSON.stringify(pinned))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// The single pinned game, if any -- scoped to one sport + one day. Pinning a
// game replaces whatever was pinned before (in any sport), and the pin is
// dropped the moment the calendar day rolls over. `today` is the same
// midnight-rollover-aware value App.jsx already tracks, so both go stale
// together instead of drifting apart.
export function usePinnedGame(today) {
  const [pinned, setPinned] = useState(load)

  useEffect(() => {
    setPinned((current) => {
      if (current && current.date !== today) {
        persist(null)
        return null
      }
      return current
    })
  }, [today])

  const togglePin = useCallback((sportKey, gameId) => {
    setPinned((current) => {
      const next =
        current && current.sportKey === sportKey && current.gameId === gameId
          ? null
          : { sportKey, gameId, date: todayParam() }
      persist(next)
      return next
    })
  }, [])

  const isPinned = useCallback(
    (sportKey, gameId) => Boolean(pinned && pinned.sportKey === sportKey && pinned.gameId === gameId),
    [pinned],
  )

  return { pinned, isPinned, togglePin }
}
