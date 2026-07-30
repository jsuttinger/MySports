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

function TeamRow({ team, showScore }) {
  return (
    <div className={`team-row${team.winner ? ' team-row--winner' : ''}`}>
      {team.logo ? (
        <img className="team-logo" src={team.logo} alt="" width={36} height={36} />
      ) : (
        <div className="team-logo team-logo--placeholder" />
      )}
      <span className="team-name">{team.name}</span>
      {showScore && <span className="team-score">{team.score ?? '-'}</span>}
    </div>
  )
}

function TeamScoreCard({ game }) {
  const showScore = game.status !== 'scheduled'
  const accent = game.home.color || game.away.color || '#7c7c88'

  return (
    <article className={`game-card game-card--${game.status}`} style={{ '--accent': accent }}>
      <div className="game-card__status">
        {game.status === 'live' && <span className="badge badge--live">LIVE</span>}
        {game.status === 'final' && <span className="badge badge--final">FINAL</span>}
        <span className="status-detail">
          {game.status === 'scheduled' ? formatStartTime(game.startTime) : game.statusDetail}
        </span>
      </div>

      <div className="game-card__teams">
        <TeamRow team={game.away} showScore={showScore} />
        <TeamRow team={game.home} showScore={showScore} />
      </div>

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
