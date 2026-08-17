const STATUS_ORDER = { live: 0, scheduled: 1, final: 2 }

// Live first, then scheduled (soonest first), then final (most recent first).
function compareByStatus(a, b) {
  const rankDiff = (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)
  if (rankDiff !== 0) return rankDiff
  if (a.status === 'scheduled') return new Date(a.startTime) - new Date(b.startTime)
  if (a.status === 'final') return new Date(b.startTime) - new Date(a.startTime)
  return 0
}

// Games involving a favorited team come first, then any pinned games (that
// aren't already in that group), then everything else -- each group still
// internally ordered live > upcoming > final.
export function sortGames(games, { isFavoriteGame, isPinnedGame } = {}) {
  function tier(game) {
    if (isFavoriteGame?.(game)) return 0
    if (isPinnedGame?.(game)) return 1
    return 2
  }

  return [...games].sort((a, b) => {
    const tierDiff = tier(a) - tier(b)
    if (tierDiff !== 0) return tierDiff
    return compareByStatus(a, b)
  })
}
