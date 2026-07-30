function SportTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={`sport-tab${active ? ' sport-tab--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

export default SportTab
