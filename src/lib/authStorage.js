const SESSION_KEY = 'mediconnect.session.v1'
const CACHE_KEY = 'mediconnect.portal.cache.v1'

function readJSON(key, fallback = null) {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return fallback
    }

    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function loadSession() {
  const session = readJSON(SESSION_KEY, null)

  if (!session || !session.token || !session.role || !session.userId) {
    return null
  }

  return session
}

function saveSession(session) {
  writeJSON(SESSION_KEY, session)
}

function clearSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SESSION_KEY)
}

function loadPortalCache() {
  return readJSON(CACHE_KEY, { dashboard: null, publicDoctors: [] })
}

function savePortalCache(cache) {
  writeJSON(CACHE_KEY, cache)
}

function clearPortalCache() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(CACHE_KEY)
}

export {
  clearPortalCache,
  clearSession,
  loadPortalCache,
  loadSession,
  savePortalCache,
  saveSession,
}
