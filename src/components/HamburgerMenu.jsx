import { useEffect, useRef, useState } from 'react'

// Header hamburger button opening a dropdown of sport leagues.
function HamburgerMenu({ sports, activeSport, onSelect }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleOutsideClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('click', handleOutsideClick, true)
    return () => document.removeEventListener('click', handleOutsideClick, true)
  }, [open])

  return (
    <div className="hamburger-menu" ref={wrapperRef}>
      <button
        type="button"
        className="hamburger-menu__button"
        aria-label="Open sport menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="hamburger-menu__panel">
          {sports.map((sport) => (
            <button
              key={sport.key}
              type="button"
              className={`hamburger-menu__item${sport.key === activeSport ? ' hamburger-menu__item--active' : ''}`}
              onClick={() => {
                onSelect(sport.key)
                setOpen(false)
              }}
            >
              <img
                className="hamburger-menu__item-logo"
                src={sport.logo}
                alt=""
                aria-hidden="true"
              />
              <span>{sport.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HamburgerMenu
