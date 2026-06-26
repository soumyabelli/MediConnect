const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 10

async function hashPassword(password) {
  return bcrypt.hash(String(password), SALT_ROUNDS)
}

async function comparePassword(password, hash) {
  if (!hash) {
    return false
  }

  return bcrypt.compare(String(password), hash)
}

module.exports = {
  comparePassword,
  hashPassword,
}
