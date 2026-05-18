export const ensureUnit = (value, defaultValue) => {
  if (!value) return defaultValue
  if (value === 'auto') return 'auto'
  if (typeof value === 'number') return value + 'px'
  if (typeof value === 'string' && /^\d+$/.test(value)) return value + 'px'
  return value
}
