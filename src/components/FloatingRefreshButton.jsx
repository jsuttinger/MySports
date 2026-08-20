import { useState } from 'react'
import RefreshIcon from './RefreshIcon'

// Fixed-position manual refresh, reachable from anywhere in the list --
// unlike pull-to-refresh, which only works from the very top of the page.
// Triggers the exact same refresh as the 60s auto-refresh cycle, so scroll
// position and every card's expanded/collapsed state are untouched by it
// for the same reason auto-refresh already leaves them alone: this only
// updates data already on screen, nothing structural.
function FloatingRefreshButton({ onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)

  async function handleClick() {
    if (refreshing) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <button
      type="button"
      className="floating-refresh-button"
      onClick={handleClick}
      disabled={refreshing}
      aria-label="Refresh scores"
    >
      <RefreshIcon
        className={`floating-refresh-button__icon${refreshing ? ' floating-refresh-button__icon--spinning' : ''}`}
      />
    </button>
  )
}

export default FloatingRefreshButton
