import { useEffect, useState } from 'react'

function formatElapsed(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  return `${minutes}m ago`
}

// Re-renders once a second (only while the tab is visible) so the "Xs ago"
// text stays current without polling anything.
function LastUpdated({ timestamp }) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!timestamp) return
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') forceTick((tick) => tick + 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [timestamp])

  if (!timestamp) return null

  return <p className="last-updated">Updated {formatElapsed(Date.now() - timestamp)}</p>
}

export default LastUpdated
