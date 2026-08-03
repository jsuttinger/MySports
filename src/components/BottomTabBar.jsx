import SportIcon from './SportIcon'

// OPTION A (nav preview): fixed bottom tab bar, iOS-style.
function BottomTabBar({ sports, activeSport, onSelect }) {
  return (
    <nav className="bottom-tab-bar" aria-label="Sport navigation">
      {sports.map((sport) => (
        <button
          key={sport.key}
          type="button"
          className={`bottom-tab${sport.key === activeSport ? ' bottom-tab--active' : ''}`}
          onClick={() => onSelect(sport.key)}
        >
          <SportIcon sportKey={sport.key} className="bottom-tab__icon" />
          <span className="bottom-tab__label">{sport.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomTabBar
