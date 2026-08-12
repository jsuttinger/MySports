import { useEffect, useRef, useState } from 'react'

// Threshold (px) the user must drag down past before a release triggers a
// refresh, and the cap on how far the indicator will visually travel.
const PULL_THRESHOLD = 64
const MAX_PULL = 96
// Rubber-band resistance: the indicator moves slower than the finger.
const RESISTANCE = 0.5

// Custom pull-to-refresh gesture for the whole scrolling page. Installed PWAs
// (iOS/Android standalone mode) don't get the browser's native pull-to-
// refresh, so this recreates it with touch events: pulling down from the
// very top of the page reveals a spinner, and releasing past the threshold
// calls `onRefresh` and waits for it before snapping back.
function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const gestureRef = useRef({ startY: null, pulling: false })
  const pullDistanceRef = useRef(0)
  const refreshingRef = useRef(false)

  useEffect(() => {
    refreshingRef.current = refreshing
  }, [refreshing])

  useEffect(() => {
    function updatePullDistance(value) {
      pullDistanceRef.current = value
      setPullDistance(value)
    }

    function handleTouchStart(event) {
      if (refreshingRef.current || window.scrollY > 0) return
      gestureRef.current = { startY: event.touches[0].clientY, pulling: true }
    }

    function handleTouchMove(event) {
      const gesture = gestureRef.current
      if (!gesture.pulling) return
      if (window.scrollY > 0) {
        gesture.pulling = false
        updatePullDistance(0)
        return
      }
      const delta = event.touches[0].clientY - gesture.startY
      if (delta <= 0) {
        updatePullDistance(0)
        return
      }
      updatePullDistance(Math.min(MAX_PULL, delta * RESISTANCE))
      if (delta > 4 && event.cancelable) event.preventDefault()
    }

    // Deciding whether to fire a refresh, and doing so, happens here as a
    // plain event-handler side effect -- never inside a setState updater,
    // since React may invoke those more than once (e.g. StrictMode) to
    // verify they're pure.
    function handleTouchEnd() {
      const gesture = gestureRef.current
      if (!gesture.pulling) return
      gesture.pulling = false

      if (pullDistanceRef.current >= PULL_THRESHOLD && !refreshingRef.current) {
        setRefreshing(true)
        updatePullDistance(PULL_THRESHOLD)
        Promise.resolve()
          .then(onRefresh)
          .catch(() => {})
          .finally(() => {
            setRefreshing(false)
            updatePullDistance(0)
          })
      } else {
        updatePullDistance(0)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [onRefresh])

  const displayDistance = refreshing ? PULL_THRESHOLD : pullDistance
  const progress = Math.min(1, displayDistance / PULL_THRESHOLD)
  // No transition while the finger is actively dragging (must track 1:1),
  // only when snapping back or settling into the refreshing state.
  const settling = refreshing || !gestureRef.current.pulling

  return (
    <>
      <div
        className="pull-refresh-indicator"
        style={{ height: displayDistance, opacity: progress, transition: settling ? undefined : 'none' }}
        aria-hidden="true"
      >
        <span
          className={`pull-refresh-spinner${refreshing ? ' pull-refresh-spinner--spinning' : ''}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 360}deg)` }}
        />
      </div>
      {children}
    </>
  )
}

export default PullToRefresh
