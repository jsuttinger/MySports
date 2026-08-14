import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'mysports:favoriteTeams'

// Team ids are only unique within a sport, so key on both.
function favoriteKey(sportKey, teamId) {
  return `${sportKey}:${teamId}`
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

// Favorite teams across all sports, persisted to localStorage so they
// survive a reload.
export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]))
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
  }, [favorites])

  const isFavorite = useCallback(
    (sportKey, teamId) => favorites.has(favoriteKey(sportKey, teamId)),
    [favorites],
  )

  const toggleFavorite = useCallback((sportKey, teamId) => {
    const key = favoriteKey(sportKey, teamId)
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  return { isFavorite, toggleFavorite }
}
