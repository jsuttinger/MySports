import { useEffect, useState } from 'react'
import { pickAccentColor } from '../utils/teamColor'

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

function TeamRow({ team, showScore, muted }) {
  return (
    <div className="team-row">
      <TeamLogo team={team} />
      <span
        className={`team-name${team.winner ? ' team-name--winner' : ''}${muted ? ' team-name--muted' : ''}`}
      >
        {team.name}
      </span>
      {showScore && (
        <span className={`team-score${muted ? ' team-score--muted' : ''}`}>{team.score ?? '-'}</span>
      )}
    </div>
  )
}

function BaseDiamond({ onFirst, onSecond, onThird }) {
  return (
    <span className="diamond" title="Runners on base">
      <span className={`diamond__base diamond__base--second${onSecond ? ' diamond__base--on' : ''}`} />
      <span className={`diamond__base diamond__base--third${onThird ? ' diamond__base--on' : ''}`} />
      <span className={`diamond__base diamond__base--first${onFirst ? ' diamond__base--on' : ''}`} />
    </span>
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

function TeamScoreCard({ game }) {
  const showScore = game.status !== 'scheduled'
  const isFinal = game.status === 'final'
  const hasWinner = game.home.winner || game.away.winner
  const accent = pickAccentColor(game)

  const [flashing, setFlashing] = useState(false)
  useEffect(() => {
    if (!game.scoreChangedAt) return
    setFlashing(true)
    const timeout = setTimeout(() => setFlashing(false), SCORE_FLASH_MS)
    return () => clearTimeout(timeout)
  }, [game.scoreChangedAt])

  return (
    <article
      className={`game-card game-card--${game.status}${flashing ? ' game-card--flash' : ''}`}
      style={{ '--accent': accent }}
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
      </div>

      <div className="game-card__teams">
        <TeamRow
          team={game.away}
          showScore={showScore}
          muted={isFinal && hasWinner && !game.away.winner}
        />
        <TeamRow
          team={game.home}
          showScore={showScore}
          muted={isFinal && hasWinner && !game.home.winner}
        />
      </div>

      {game.status === 'live' && <LiveDetail situation={game.situation} />}

      {game.odds && (game.odds.spreadDetails || game.odds.overUnder != null) && (
        <div className="game-card__odds">
          {game.odds.spreadDetails && <span>Spread {game.odds.spreadDetails}</span>}
          {game.odds.overUnder != null && <span>O/U {game.odds.overUnder}</span>}
        </div>
      )}
    </article>
  )
}

export default TeamScoreCard
