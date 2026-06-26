require('dotenv').config()

const http = require('http')
const app = require('./app')
const db = require('./config/db')
const { seedInitialData } = require('./utils/seed')
const { setupRealtime } = require('./utils/realtime')

const MONGO_STRICT = process.env.MONGO_STRICT === 'true'
const RETRY_MS = Number(process.env.MONGO_RETRY_MS || 30_000)

let mongoStatus = {
  connected: false,
  lastError: null,
  lastAttemptAt: null,
}

function setConnected() {
  mongoStatus = { ...mongoStatus, connected: true, lastError: null }
}

function setDisconnected(err) {
  mongoStatus = {
    ...mongoStatus,
    connected: false,
    lastError: err ? String(err.message || err) : 'Unknown error',
  }
}

async function attemptConnect({ doSeed = false } = {}) {
  const uri = process.env.MONGO_URI
  mongoStatus.lastAttemptAt = new Date().toISOString()

  try {
    console.log('[MongoDB] Attempting connection...')
    await db.connectDB(uri)
    console.log('[MongoDB] Connected successfully')

    setConnected()

    if (doSeed) {
      await seedInitialData()
      console.log('[MongoDB] Seed check complete')
    }

    return true
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err)
    setDisconnected(err)
    return false
  }
}

function startMongoRetryLoop() {
  if (startMongoRetryLoop.started) return
  startMongoRetryLoop.started = true

  setInterval(async () => {
    if (mongoStatus.connected) return
    console.log(`[MongoDB] Retrying connection in ${Math.round(RETRY_MS / 1000)}s...`)
    await attemptConnect({ doSeed: false })
  }, RETRY_MS)
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'MediConnect API',
    serverStatus: 'running',
    db: {
      connected: mongoStatus.connected,
      lastError: mongoStatus.lastError,
      lastAttemptAt: mongoStatus.lastAttemptAt,
    },
  })
})

async function start() {
  const port = process.env.PORT || 5000
  const server = http.createServer(app)
  setupRealtime(server)

  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })

  if (MONGO_STRICT) {
    const ok = await attemptConnect({ doSeed: true })
    if (!ok) {
      // eslint-disable-next-line no-process-exit
      process.exit(1)
    }
    return
  }

  startMongoRetryLoop()
  await attemptConnect({ doSeed: true })
}

start()

