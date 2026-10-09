const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { verifyTelegramInitData } = require('../middleware/auth');

const router = Router();
const BCRYPT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TTL = '30d';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ id: user.id, display_name: user.display_name }, JWT_SECRET, { expiresIn: JWT_TTL });
}

// POST /auth/telegram
router.post('/telegram', async (req, res, next) => {
  try {
    const { initData, lang = 'uz' } = req.body;
    if (!initData) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'initData required' } });

    const tgUser = verifyTelegramInitData(initData);
    if (!tgUser) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid Telegram initData' } });

    const displayName = tgUser.first_name ?? tgUser.username ?? `User${tgUser.id}`;
    const safeLang = ['uz', 'ru', 'en'].includes(lang) ? lang : 'uz';

    const { rows } = await pool.query(
      `INSERT INTO users (telegram_id, telegram_username, display_name, lang)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (telegram_id) DO UPDATE
         SET telegram_username = EXCLUDED.telegram_username,
             last_active_at = now()
       RETURNING id, display_name, total_xp, lang, (xmax = 0) AS is_new_user`,
      [tgUser.id, tgUser.username ?? null, displayName, safeLang]
    );

    const user = rows[0];
    res.status(user.is_new_user ? 201 : 200).json({ token: signToken(user), user, is_new_user: user.is_new_user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/register — email + username
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, display_name, lang = 'uz' } = req.body;

    if (!username || !email || !password || !display_name) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'username, email, password, display_name required' } });
    }
    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'username: 3-30 chars, letters/numbers/_ only' } });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid email format' } });
    }
    if (password.length < 8) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'password must be at least 8 characters' } });
    }
    // Password strength: at least 1 uppercase, 1 lowercase, 1 number
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'password must contain uppercase, lowercase, and number' } });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const safeLang = ['uz', 'ru', 'en'].includes(lang) ? lang : 'uz';

    try {
      const { rows } = await pool.query(
        `INSERT INTO users (username, email, password_hash, display_name, lang)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, display_name, total_xp, lang, email`,
        [username.toLowerCase(), email.toLowerCase(), password_hash, display_name, safeLang]
      );
      res.status(201).json({ token: signToken(rows[0]), user: rows[0] });
    } catch (err) {
      if (err.code === '23505') { // unique_violation
        const constraint = err.constraint || '';
        if (constraint.includes('username')) {
          return res.status(409).json({ error: { code: 'USERNAME_TAKEN', message: 'Username already taken.' } });
        }
        if (constraint.includes('email')) {
          return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Email already registered.' } });
        }
        return res.status(409).json({ error: { code: 'CONFLICT', message: 'Username or email already taken.' } });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// POST /auth/login — accepts email or username
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username
    if (!identifier || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'identifier and password required' } });
    }

    const isEmail = EMAIL_RE.test(identifier);
    const field = isEmail ? 'email' : 'username';
    const value = isEmail ? identifier.toLowerCase() : identifier.toLowerCase();

    const { rows } = await pool.query(
      `SELECT id, display_name, total_xp, lang, email, password_hash FROM users WHERE ${field} = $1`,
      [value]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials.' } });
    }

    const { password_hash, ...user } = rows[0];
    await pool.query(`UPDATE users SET last_active_at = now() WHERE id = $1`, [user.id]);
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
