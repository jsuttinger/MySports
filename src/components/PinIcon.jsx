// Simple pin (map-marker-style) icon for the pin-to-top button on a game
// card. Filled when pinned, outline otherwise.
function PinIcon({ pinned, className = '' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="6.5" r="4.25" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 10.5L8 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default PinIcon
