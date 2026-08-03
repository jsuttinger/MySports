const OPTIONS = [
  { value: 'top', label: 'Top tabs (current)' },
  { value: 'bottom', label: 'A: Bottom bar' },
  { value: 'hamburger', label: 'B: Hamburger' },
]

// TEMPORARY dev control for comparing nav styles side by side. Not part of
// the app's real UI — remove once a style is picked.
function NavPreviewSwitcher({ value, onChange }) {
  return (
    <div className="nav-preview-switcher">
      <span className="nav-preview-switcher__label">Nav preview (temporary)</span>
      <div className="nav-preview-switcher__options">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`nav-preview-switcher__option${value === option.value ? ' nav-preview-switcher__option--active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default NavPreviewSwitcher
