function Chevron({ expanded, className = '' }) {
  return (
    <svg
      className={`chevron${expanded ? ' chevron--expanded' : ''}${className ? ` ${className}` : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Chevron
