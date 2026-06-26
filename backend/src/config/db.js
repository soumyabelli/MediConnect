const mongoose = require('mongoose')

function buildMongoOptions() {
  return {
    serverSelectionTimeoutMS: 10000, // 10 seconds
    family: 4 // Force IPv4
  }
}



async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is not defined')
  }

  const options = buildMongoOptions()

  // Some older tutorials/URIs include `strictQuery` as a connection-string option.
  // Newer mongodb drivers may reject it, so strip it defensively.
  const sanitizedUri = String(uri).replace(/[?&]strictquery=[^&]*/gi, (m) => (m.startsWith('?') ? '?' : '&'))

  await mongoose.connect(sanitizedUri, options)
  return mongoose.connection
}


async function disconnectDB() {
  if (!mongoose.connection) return
  await mongoose.disconnect()
}

function isConnected() {
  // 1 = connected, 2 = connecting
  return mongoose.connection && mongoose.connection.readyState === 1
}

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
  isConnected,
}





