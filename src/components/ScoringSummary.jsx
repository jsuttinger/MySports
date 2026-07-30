import DetailRow from './DetailRow'

// Visible by default (not behind a toggle) whenever the card is expanded —
// unlike a full box score, which stays opt-in behind its own button. Shared
// across sports (MLB, NFL, NHL); each caller supplies its own sport-
// appropriate empty-state wording ("No runs scored yet." vs. "No goals
// scored yet." etc).
function ScoringSummary({ loading, error, plays, emptyMessage = 'No scoring yet.' }) {
  return (
    <div className="scoring-summary">
      <h4 className="section-heading">Scoring Summary</h4>
      {loading && <p className="game-detail__placeholder">Loading scoring plays…</p>}
      {error && <p className="state-message--error">Couldn't load scoring plays.</p>}
      {!loading && !error && (!plays || plays.length === 0) && (
        <p className="game-detail__placeholder">{emptyMessage}</p>
      )}
      {!loading && !error && plays && plays.length > 0 && (
        <div className="scoring-summary__list">
          {plays.map((play) => (
            <DetailRow key={play.id} label={play.inningLabel} value={play.text} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ScoringSummary
