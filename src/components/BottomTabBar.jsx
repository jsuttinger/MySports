// Fixed bottom tab bar, iOS-style — the app's sport navigation.
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
          <img className="bottom-tab__logo" src={sport.logo} alt="" aria-hidden="true" />
          <span className="bottom-tab__label">{sport.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomTabBar
