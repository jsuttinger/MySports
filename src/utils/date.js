// ESPN's scoreboard `dates` param wants YYYYMMDD. We build this from the
// browser's LOCAL calendar fields (not toISOString, which is UTC and would
// silently shift the date for anyone west of UTC in the evening).
export function formatDateParam(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

export function todayParam() {
  return formatDateParam(new Date())
}

export function parseDateParam(param) {
  const y = Number(param.slice(0, 4))
  const m = Number(param.slice(4, 6)) - 1
  const d = Number(param.slice(6, 8))
  return new Date(y, m, d)
}

export function addDays(date, delta) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + delta)
  return copy
}

// A range of dates centered on `centerDate`, as Date objects.
export function buildDateRange(centerDate, daysBack, daysForward) {
  const range = []
  for (let i = -daysBack; i <= daysForward; i++) {
    range.push(addDays(centerDate, i))
  }
  return range
}
