import { useEffect, useRef, useState } from 'react'
import { pickAccentColor } from '../utils/teamColor'
import BaseDiamond from './BaseDiamond'
import Chevron from './Chevron'
import GameDetail from './GameDetail'
import PinIcon from './PinIcon'

const SCORE_FLASH_MS = 1400

function formatStartTime(iso) {
  if (!iso) return 'TBD'
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function initialsFor(team) {
  if (team.abbreviation) return team.abbreviation.slice(0, 3).toUpperCase()
  return team.name.slice(0, 3).toUpperCase()
}

function TeamLogo({ team }) {
  const [failed, setFailed] = useState(false)

  if (!team.logo || failed) {
    return (
      <div className="team-logo team-logo--fallback">
        <span>{initialsFor(team)}</span>
      </div>
    )
  }

  return (
    <img
      className="team-logo"
      src={team.logo}
      alt=""
      width={36}
      height={36}
      onError={() => setFailed(true)}
    />
  )
}

function TeamRow({ team, showScore, muted, spread }) {
  return (
    <div className="team-row">
      <TeamLogo team={team} />
      <span className="team-name-group">
        <span className="team-name-line">
          <span
            className={`team-name${team.winner ? ' team-name--winner' : ''}${muted ? ' team-name--muted' : ''}`}
          >
            {team.name}
          </span>
          {spread && <span className="team-spread">{spread}</span>}
        </span>
        {team.record && <span className="team-record">{team.record}</span>}
      </span>
      {showScore && (
        <span className={`team-score${muted ? ' team-score--muted' : ''}`}>{team.score ?? '-'}</span>
      )}
    </div>
  )
}

function LiveDetail({ situation }) {
  if (!situation) return null

  const hasCount = situation.balls != null && situation.strikes != null
  const hasFootball = Boolean(situation.downDistance)
  const hasBases = situation.onFirst || situation.onSecond || situation.onThird

  if (!hasCount && !hasFootball && !situation.lastPlay) return null

  return (
    <div className="live-detail">
      {hasFootball && (
        <div className="live-detail__row">
          <span className="live-detail__tag">{situation.downDistance}</span>
          {situation.possession && (
            <span className="live-detail__possession">{situation.possession} ball</span>
          )}
        </div>
      )}
      {hasCount && (
        <div className="live-detail__row">
          <span className="live-detail__tag">
            {situation.balls}-{situation.strikes}, {situation.outs ?? 0} out
            {situation.outs === 1 ? '' : 's'}
          </span>
          {hasBases && (
            <BaseDiamond
              onFirst={situation.onFirst}
              onSecond={situation.onSecond}
              onThird={situation.onThird}
            />
          )}
        </div>
      )}
      {situation.lastPlay && <p className="live-detail__play">{situation.lastPlay}</p>}
    </div>
  )
}

function TeamScoreCard({ game, sportKey, expanded, onToggle, pinned, onTogglePin }) {
  const showScore = game.status !== 'scheduled'
  const isFinal = game.status === 'final'
  const hasWinner = game.home.winner || game.away.winner
  const accent = pickAccentColor(game)
  const homeGlow = game.home.color || accent
  const awayGlow = game.away.color || accent
  const cardRef = useRef(null)

  // Only show a line inline next to a team's name when we can clearly tell
  // who's favored; otherwise fall back to the raw odds text below. MLB shows
  // the moneyline (baseball's primary bet type) instead of the run line.
  const favoriteSide = game.odds?.favoriteSide ?? null
  const favoriteValue =
    sportKey === 'mlb'
      ? favoriteSide === 'away'
        ? game.odds?.moneylineAway
        : favoriteSide === 'home'
          ? game.odds?.moneylineHome
          : null
      : game.odds?.spreadValue != null
        ? `-${game.odds.spreadValue}`
        : null
  const hasInlineLine = Boolean(favoriteSide) && favoriteValue != null
  const awaySpread = hasInlineLine && favoriteSide === 'away' ? favoriteValue : null
  const homeSpread = hasInlineLine && favoriteSide === 'home' ? favoriteValue : null
  const fallbackSpreadText = !hasInlineLine ? game.odds?.spreadDetails : null

  const [flashing, setFlashing] = useState(false)
  useEffect(() => {
    if (!game.scoreChangedAt) return
    setFlashing(true)
    const timeout = setTimeout(() => setFlashing(false), SCORE_FLASH_MS)
    return () => clearTimeout(timeout)
  }, [game.scoreChangedAt])

  // "Tap elsewhere to collapse": while this card is expanded, any click
  // outside it collapses it. Clicks on the card itself are handled by its
  // own onClick toggle below, so this only ever fires for outside clicks.
  useEffect(() => {
    if (!expanded) return
    function handleOutsideClick(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) onToggle()
    }
    document.addEventListener('click', handleOutsideClick, true)
    return () => document.removeEventListener('click', handleOutsideClick, true)
  }, [expanded, onToggle])

  return (
    <article
      ref={cardRef}
      className={`game-card game-card--${game.status}${flashing ? ' game-card--flash' : ''}${pinned ? ' game-card--pinned' : ''}`}
      style={{ '--accent': accent, '--home-glow': homeGlow, '--away-glow': awayGlow }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className="game-card__status">
        {game.status === 'live' && (
          <span className="live-indicator">
            <span className="live-dot" />
            LIVE
          </span>
        )}
        <span className="status-detail">
          {game.status === 'scheduled' ? formatStartTime(game.startTime) : game.statusDetail}
        </span>
        <span className="game-card__status-actions">
          {onTogglePin && (
            <button
              type="button"
              className={`pin-button${pinned ? ' pin-button--active' : ''}`}
              onClick={(event) => {
                event.stopPropagation()
                onTogglePin()
              }}
              aria-pressed={pinned}
              aria-label={pinned ? 'Unpin game' : 'Pin game to top'}
            >
              <PinIcon pinned={pinned} />
            </button>
          )}
          <Chevron expanded={expanded} className="expand-chevron" />
        </span>
      </div>

      <div className="game-card__teams">
        <TeamRow
          team={game.away}
          showScore={showScore}
          muted={isFinal && hasWinner && !game.away.winner}
          spread={awaySpread}
        />
        <TeamRow
          team={game.home}
          showScore={showScore}
          muted={isFinal && hasWinner && !game.home.winner}
          spread={homeSpread}
        />
      </div>

      {game.status === 'live' && !expanded && <LiveDetail situation={game.situation} />}

      {game.odds && (fallbackSpreadText || game.odds.overUnder != null) && (
        <div className="game-card__odds">
          {fallbackSpreadText && <span>Spread {fallbackSpreadText}</span>}
          {game.odds.overUnder != null && <span>O/U {game.odds.overUnder}</span>}
        </div>
      )}

      <div className={`game-detail-wrapper${expanded ? ' game-detail-wrapper--expanded' : ''}`}>
        <div className="game-detail-inner">
          <GameDetail sportKey={sportKey} game={game} expanded={expanded} />
        </div>
      </div>
    </article>
  )
}

export default TeamScoreCard
