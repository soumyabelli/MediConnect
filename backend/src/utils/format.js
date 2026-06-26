function formatDisplayDate(value) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDisplayTime(value) {
  if (!value) {
    return ''
  }

  return String(value)
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function splitTreats(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

module.exports = {
  formatDisplayDate,
  formatDisplayTime,
  normalizeEmail,
  splitTreats,
}
