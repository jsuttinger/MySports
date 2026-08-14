import { useEffect, useState } from 'react'
import { SPORTS, fetchTeams } from '../services/espnApi'
import StarIcon from './StarIcon'

// Sports with a big enough roster (college football: 750+ teams across every
// division) that the section should start collapsed rather than dumping the
// whole list on screen.
const STARTS_COLLAPSED = new Set(['ncaaf'])

function TeamRow({ sportKey, team, favorited, onToggle }) {
  return (
    <button
      type="button"
      className={`favorite-team-row${favorited ? ' favorite-team-row--active' : ''}`}
      onClick={() => onToggle(sportKey, team.id)}
      aria-pressed={favorited}
    >
      {team.logo ? (
        <img className="favorite-team-row__logo" src={team.logo} alt="" aria-hidden="true" />
      ) : (
        <span className="favorite-team-row__logo favorite-team-row__logo--fallback" aria-hidden="true" />
      )}
      <span className="favorite-team-row__name">{team.name}</span>
      <StarIcon filled={favorited} className="favorite-team-row__star" />
    </button>
  )
}

function SportSection({ sport, query, isFavorite, onToggle, open, onToggleOpen }) {
  const [teams, setTeams] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (teams || error) return
    fetchTeams(sport.key)
      .then(setTeams)
      .catch((err) => setError(err.message ?? String(err)))
  }, [sport.key, teams, error])

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = normalizedQuery
    ? (teams ?? []).filter((team) => team.name.toLowerCase().includes(normalizedQuery))
    : teams

  // While searching, a section with no matches just disappears instead of
  // showing an empty, pointlessly-expanded group.
  if (normalizedQuery && teams && filtered.length === 0) return null

  const expanded = normalizedQuery ? true : open

  return (
    <section className="favorites-sport-group">
      <button
        type="button"
        className="favorites-sport-group__header"
        onClick={() => onToggleOpen(sport.key)}
        aria-expanded={expanded}
      >
        <img className="favorites-sport-group__logo" src={sport.logo} alt="" aria-hidden="true" />
        <span className="favorites-sport-group__label">{sport.label}</span>
        <span className="favorites-sport-group__chevron">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="favorites-sport-group__teams">
          {error && <p className="state-message--error">Couldn't load teams: {error}</p>}
          {!teams && !error && <p className="game-detail__placeholder">Loading teams…</p>}
          {filtered?.map((team) => (
            <TeamRow
              key={team.id}
              sportKey={sport.key}
              team={team}
              favorited={isFavorite(sport.key, team.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function FavoritesScreen({ isFavorite, onToggle, onClose }) {
  const [query, setQuery] = useState('')
  const [openSections, setOpenSections] = useState(
    () => new Set(SPORTS.filter((s) => !STARTS_COLLAPSED.has(s.key)).map((s) => s.key)),
  )

  function toggleOpen(sportKey) {
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(sportKey)) next.delete(sportKey)
      else next.add(sportKey)
      return next
    })
  }

  return (
    <div className="favorites-screen" role="dialog" aria-label="Favorite teams">
      <header className="favorites-screen__header">
        <h2>Favorite Teams</h2>
        <button type="button" className="favorites-screen__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <input
        type="text"
        className="favorites-screen__search"
        placeholder="Search teams…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="favorites-screen__list">
        {SPORTS.map((sport) => (
          <SportSection
            key={sport.key}
            sport={sport}
            query={query}
            isFavorite={isFavorite}
            onToggle={onToggle}
            open={openSections.has(sport.key)}
            onToggleOpen={toggleOpen}
          />
        ))}
      </div>
    </div>
  )
}

export default FavoritesScreen
