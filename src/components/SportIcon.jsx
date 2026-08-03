// Small minimal line icons, one per sport, for the bottom tab bar preview.
function SportIcon({ sportKey, className }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    className,
    'aria-hidden': true,
  }

  if (sportKey === 'nfl') {
    return (
      <svg {...common}>
        <ellipse cx="12" cy="12" rx="9" ry="5.2" transform="rotate(-40 12 12)" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7.8 14.3L16.2 9.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path
          d="M9 14.6l1-1.7M10.9 12.4l1-1.7M12.8 10.2l1-1.7"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (sportKey === 'nba') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M5.3 5.3c2.7 2.7 2.7 10.7 0 13.4M18.7 5.3c-2.7 2.7-2.7 10.7 0 13.4"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    )
  }

  if (sportKey === 'mlb') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6.3 6.3c3 3 3 8.4 0 11.4M17.7 6.3c-3 3-3 8.4 0 11.4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    )
  }

  if (sportKey === 'nhl') {
    return (
      <svg {...common}>
        <rect x="3.5" y="9" width="17" height="6" rx="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }

  return null
}

export default SportIcon
