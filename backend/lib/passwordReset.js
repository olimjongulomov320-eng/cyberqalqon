const crypto = require('crypto');

/** Reset links live for one hour. */
const RESET_TTL_MINUTES = 60;

/** 256-bit URL-safe token. Only its hash is stored, so a DB leak is not a reset. */
function generateToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

/** Returns an error message, or null when the password is acceptable. */
function passwordProblem(password) {
  if (typeof password !== 'string') return 'password must be a string';
  if (password.length < 8) return 'password must be at least 8 characters';
  if (password.length > 128) return 'password must be at most 128 characters';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'password must contain uppercase, lowercase, and number';
  }
  return null;
}

module.exports = { RESET_TTL_MINUTES, generateToken, hashToken, passwordProblem };
