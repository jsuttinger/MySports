// Star icon for the favorites header button and per-team favorite toggles.
// Filled when active, outline otherwise.
function StarIcon({ filled, className = '' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M10 2.2L12.4 7.4L18 8.2L14 12.2L14.9 17.8L10 15.1L5.1 17.8L6 12.2L2 8.2L7.6 7.4L10 2.2Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default StarIcon
