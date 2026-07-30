import { useEffect, useMemo, useRef } from 'react'
import { buildDateRange, formatDateParam, parseDateParam } from '../utils/date'

const DAYS_BACK = 3
const DAYS_FORWARD = 4

function DateStrip({ selectedDate, today, onSelect }) {
  const range = useMemo(() => buildDateRange(parseDateParam(today), DAYS_BACK, DAYS_FORWARD), [today])
  const selectedRef = useRef(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedDate])

  return (
    <div className="date-strip">
      {range.map((date) => {
        const param = formatDateParam(date)
        const isSelected = param === selectedDate
        const isToday = param === today

        return (
          <button
            key={param}
            ref={isSelected ? selectedRef : null}
            type="button"
            className={`date-pill${isSelected ? ' date-pill--selected' : ''}`}
            onClick={() => onSelect(param)}
          >
            <span className="date-pill__day">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
            <span className={`date-pill__date${isToday ? ' date-pill__date--today' : ''}`}>{date.getDate()}</span>
            <span className={`date-pill__dot${isToday ? ' date-pill__dot--visible' : ''}`} />
          </button>
        )
      })}
    </div>
  )
}

export default DateStrip
