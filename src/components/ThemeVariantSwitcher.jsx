const OPTIONS = [
  { value: 'none', label: 'Current' },
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
]

// TEMPORARY: lets you flip between style-mockup variations live against
// real data, for comparison. Remove once a direction is picked (or none).
function ThemeVariantSwitcher({ value, onChange }) {
  return (
    <div className="theme-variant-switcher">
      <span className="theme-variant-switcher__label">Style preview (temporary)</span>
      <div className="theme-variant-switcher__options">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`theme-variant-switcher__option${
              value === option.value ? ' theme-variant-switcher__option--active' : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeVariantSwitcher
