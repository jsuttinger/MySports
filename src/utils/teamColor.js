function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const value = clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean
  const num = parseInt(value, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

// Perceived brightness (ITU-R BT.601), 0-255. Below ~30 reads as "black" on
// our near-black background, so a stripe in that color would be invisible.
function isTooDark(hex) {
  if (!hex) return true
  const [r, g, b] = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 < 30
}

const FALLBACK_ACCENT = '#6e6e73'

// Picks a visible accent color for a game card: home color first, falling
// back through the other team colors when the preferred one is too dark to
// read against the background, so every card gets a consistent, visible edge.
export function pickAccentColor(game) {
  const candidates = [
    game.home?.color,
    game.home?.alternateColor,
    game.away?.color,
    game.away?.alternateColor,
  ]
  return candidates.find((color) => color && !isTooDark(color)) ?? FALLBACK_ACCENT
}
