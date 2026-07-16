const crypto = require('crypto');

function hashToken(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function referenciaPago() {
  return `FMV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

module.exports = { hashToken, randomToken, referenciaPago };
