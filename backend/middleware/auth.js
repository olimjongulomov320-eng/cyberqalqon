const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function parseBearer(req) {
  const header = req.headers.authorization ?? '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

// Attaches req.user if token is valid; never rejects
function optionalAuth(req, _res, next) {
  req.user = parseBearer(req);
  next();
}

// Rejects with 401 if no valid token
function requireAuth(req, res, next) {
  req.user = parseBearer(req);
  if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Valid JWT required.' } });
  next();
}

// Verify Telegram Web App initData signature
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
function verifyTelegramInitData(initDataString) {
  const params = new URLSearchParams(initDataString);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (expectedHash !== hash) return null;

  const user = JSON.parse(params.get('user') ?? 'null');
  return user; // { id, first_name, username, ... }
}

module.exports = { optionalAuth, requireAuth, verifyTelegramInitData };
