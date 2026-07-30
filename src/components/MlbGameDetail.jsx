import BaseDiamond from './BaseDiamond'
import DetailRow from './DetailRow'

function BoxScore({ away, home }) {
  const periods = Math.max(away.linescores.length, home.linescores.length)
  const hasInnings = periods > 0

  function cellsFor(team) {
    const byPeriod = new Map(team.linescores.map((ls) => [ls.period, ls.display]))
    return Array.from({ length: periods }, (_, i) => byPeriod.get(i + 1) ?? '-')
  }

  return (
    <table className="box-score">
      <thead>
        <tr>
          <th></th>
          {hasInnings && Array.from({ length: periods }, (_, i) => <th key={i}>{i + 1}</th>)}
          <th>R</th>
          <th>H</th>
          <th>E</th>
        </tr>
      </thead>
      <tbody>
        {[away, home].map((team) => (
          <tr key={team.abbreviation}>
            <td className="box-score__team">{team.abbreviation}</td>
            {hasInnings && cellsFor(team).map((value, i) => <td key={i}>{value}</td>)}
            <td>{team.score ?? '-'}</td>
            <td>{team.hits ?? '-'}</td>
            <td>{team.errors ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AtBat({ situation }) {
  if (!situation) return null

  return (
    <div className="at-bat">
      {situation.pitcher?.name && (
        <DetailRow
          label="Pitching"
          value={situation.pitcher.summary ? `${situation.pitcher.name} — ${situation.pitcher.summary}` : situation.pitcher.name}
        />
      )}
      {situation.batter?.name && (
        <DetailRow
          label="At bat"
          value={situation.batter.summary ? `${situation.batter.name} — ${situation.batter.summary}` : situation.batter.name}
        />
      )}
      <div className="at-bat__count-row">
        <span className="live-detail__tag">
          {situation.balls}-{situation.strikes}, {situation.outs ?? 0} out{situation.outs === 1 ? '' : 's'}
        </span>
        <BaseDiamond
          size="large"
          onFirst={situation.onFirst}
          onSecond={situation.onSecond}
          onThird={situation.onThird}
        />
      </div>
      {situation.lastPlay && <p className="game-detail__note">{situation.lastPlay}</p>}
    </div>
  )
}

function ScheduledInfo({ game }) {
  const hasProbables = game.away.probablePitcher || game.home.probablePitcher
  const hasRecords = game.away.record || game.home.record

  return (
    <>
      {hasProbables && (
        <>
          <DetailRow label={`${game.away.abbreviation} probable`} value={game.away.probablePitcher ?? 'TBD'} />
          <DetailRow label={`${game.home.abbreviation} probable`} value={game.home.probablePitcher ?? 'TBD'} />
        </>
      )}
      {hasRecords && (
        <DetailRow
          label="Record"
          value={`${game.away.abbreviation} ${game.away.record ?? '—'}   ·   ${game.home.abbreviation} ${game.home.record ?? '—'}`}
        />
      )}
      {!hasProbables && !hasRecords && <p className="game-detail__placeholder">No additional info yet.</p>}
    </>
  )
}

function MlbGameDetail({ game }) {
  if (game.status === 'scheduled') {
    return (
      <div className="game-detail">
        <ScheduledInfo game={game} />
      </div>
    )
  }

  return (
    <div className="game-detail">
      <BoxScore away={game.away} home={game.home} />
      {game.status === 'live' && <AtBat situation={game.situation} />}
    </div>
  )
}

export default MlbGameDetail
