// Small football glyph shown next to whichever team currently has
// possession (NFL/NCAAF only -- other sports never set possessionSide).
function FootballIcon({ className = '' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M2 8Q8 1 14 8Q8 15 2 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path
        d="M5.5 8H10.5M6.7 6.4V9.6M9.3 6.4V9.6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default FootballIcon
