const STATUS_ORDER = { live: 0, scheduled: 1, final: 2 }

// Live first, then scheduled (soonest first), then final (most recent first).
export function sortGames(games) {
  return [...games].sort((a, b) => {
    const rankDiff = (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)
    if (rankDiff !== 0) return rankDiff
    if (a.status === 'scheduled') return new Date(a.startTime) - new Date(b.startTime)
    if (a.status === 'final') return new Date(b.startTime) - new Date(a.startTime)
    return 0
  })
}
