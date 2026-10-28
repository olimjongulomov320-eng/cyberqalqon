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
const INIT_DATA_MAX_AGE_S = 24 * 60 * 60;

function verifyTelegramInitData(initDataString) {
  // Telegram login is optional: without a bot token nothing can be verified.
  if (!BOT_TOKEN) return null;
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

  const a = Buffer.from(expectedHash, 'hex');
  const b = Buffer.from(String(hash), 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Reject stale payloads so captured initData cannot be replayed forever.
  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || Date.now() / 1000 - authDate > INIT_DATA_MAX_AGE_S) return null;

  try {
    return JSON.parse(params.get('user') ?? 'null'); // { id, first_name, username, ... }
  } catch {
    return null;
  }
}

module.exports = { optionalAuth, requireAuth, verifyTelegramInitData };
