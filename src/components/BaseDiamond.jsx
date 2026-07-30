function BaseDiamond({ onFirst, onSecond, onThird, size = 'small' }) {
  return (
    <span className={`diamond diamond--${size}`} title="Runners on base">
      <span className={`diamond__base diamond__base--second${onSecond ? ' diamond__base--on' : ''}`} />
      <span className={`diamond__base diamond__base--third${onThird ? ' diamond__base--on' : ''}`} />
      <span className={`diamond__base diamond__base--first${onFirst ? ' diamond__base--on' : ''}`} />
    </span>
  )
}

export default BaseDiamond
