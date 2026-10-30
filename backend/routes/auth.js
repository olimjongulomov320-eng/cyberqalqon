const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { verifyTelegramInitData } = require('../middleware/auth');
const { forget: forgetSession } = require('../lib/sessions');
const { isAgeGroup, isMinor } = require('../curriculum/ageGroups');
const { sendMail, canSendMail } = require('../lib/mailer');
const { RESET_TTL_MINUTES, generateToken, hashToken, passwordProblem } = require('../lib/passwordReset');

const router = Router();
const BCRYPT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TTL = '30d';

const rateLimited = (_req, res) =>
  res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } });

// Brute-force protection. Only failed logins count toward the budget, so a
// legitimate user is never locked out by their own successful sign-ins.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimited,
});

// Account creation is rarer, so a tighter cap is safe and stops bulk sign-ups.
// Kept deliberately above a typical classroom size (shared NAT) so a lab of
// legitimate students is not blocked.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimited,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isStr = v => typeof v === 'string';
const bad = (res, message) =>
  res.status(422).json({ error: { code: 'VALIDATION_ERROR', message } });

// Compared against when the account does not exist, so response time does not
// reveal whether an identifier is registered.
const DUMMY_HASH = bcrypt.hashSync('cyberqalqon-timing-pad', BCRYPT_ROUNDS);

function signToken(user) {
  return jwt.sign({ id: user.id, display_name: user.display_name, v: user.token_version ?? 0 }, JWT_SECRET, { expiresIn: JWT_TTL });
}

// POST /auth/telegram
router.post('/telegram', async (req, res, next) => {
  try {
    const { initData, lang = 'uz' } = req.body ?? {};
    if (!isStr(initData) || !initData) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'initData required' } });

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
       RETURNING id, display_name, total_xp, lang, token_version, (xmax = 0) AS is_new_user`,
      [tgUser.id, tgUser.username ?? null, displayName, safeLang]
    );

    const { token_version, ...user } = rows[0];
    res.status(user.is_new_user ? 201 : 200).json({ token: signToken({ ...user, token_version }), user, is_new_user: user.is_new_user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/register — email + username
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { username, email, password, display_name, lang = 'uz', age_group: ageGroup } = req.body ?? {};

    if (![username, email, password, display_name].every(isStr)) {
      return bad(res, 'username, email, password, display_name must be strings');
    }
    if (password.length > 128) return bad(res, 'password must be at most 128 characters');
    if (ageGroup !== undefined && !isAgeGroup(ageGroup)) return bad(res, 'age_group is not a known group');
    if (!display_name.trim() || display_name.length > 40) return bad(res, 'display_name: 1-40 characters');
    if (email.length > 254) return bad(res, 'Invalid email format');

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
        `INSERT INTO users (username, email, password_hash, display_name, lang, age_group, show_on_leaderboard)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, display_name, total_xp, lang, email, age_group`,
        [username.toLowerCase(), email.toLowerCase(), password_hash, display_name.trim(), safeLang, ageGroup ?? null, !isMinor(ageGroup)]
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
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { identifier, password } = req.body ?? {}; // identifier can be email or username
    if (!isStr(identifier) || !isStr(password) || !identifier || !password || password.length > 128) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'identifier and password required' } });
    }

    const isEmail = EMAIL_RE.test(identifier);
    const field = isEmail ? 'email' : 'username';
    const value = isEmail ? identifier.toLowerCase() : identifier.toLowerCase();

    const { rows } = await pool.query(
      `SELECT id, display_name, total_xp, lang, email, age_group, token_version, password_hash FROM users WHERE ${field} = $1`,
      [value]
    );

    const ok = await bcrypt.compare(password, rows[0]?.password_hash ?? DUMMY_HASH);
    if (!rows.length || !rows[0].password_hash || !ok) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials.' } });
    }

    const { password_hash, token_version, ...user } = rows[0];
    await pool.query(`UPDATE users SET last_active_at = now() WHERE id = $1`, [user.id]);
    res.json({ token: signToken({ ...user, token_version }), user });
  } catch (err) {
    next(err);
  }
});

// Reset requests are cheap for an attacker and cost us an email each, so cap them hard.
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimited,
});

// Guessing a 256-bit token is hopeless, but typos in the new password are not:
// allow a few attempts without sharing the (much stricter) email budget.
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimited,
});

const APP_URL = () =>
  (process.env.APP_URL || (process.env.CORS_ORIGIN || '').split(',')[0] || 'http://localhost:3000').replace(/\/$/, '');

// POST /auth/forgot — always answers the same way, whether or not the address is
// registered, so it cannot be used to discover accounts.
router.post('/forgot', forgotLimiter, async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (!isStr(email) || !EMAIL_RE.test(email) || email.length > 254) {
      return bad(res, 'Invalid email format');
    }
    if (!canSendMail()) {
      return res.status(503).json({ error: { code: 'MAIL_NOT_CONFIGURED', message: 'Password reset by email is not available right now.' } });
    }

    const { rows } = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND password_hash IS NOT NULL`,
      [email.toLowerCase()]
    );
    if (rows.length) {
      const token = generateToken();
      await pool.query(`DELETE FROM password_resets WHERE user_id = $1`, [rows[0].id]);
      await pool.query(
        `INSERT INTO password_resets (token_hash, user_id, expires_at)
         VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
        [hashToken(token), rows[0].id, String(RESET_TTL_MINUTES)]
      );
      const link = `${APP_URL()}/auth/reset/?token=${encodeURIComponent(token)}`;
      try {
        await sendMail({
          to: email,
          subject: 'CyberQalqon — parolni tiklash / Сброс пароля',
          text:
            `Parolni tiklash uchun havola (${RESET_TTL_MINUTES} daqiqa amal qiladi):\n${link}\n\n` +
            `Ссылка для сброса пароля (действует ${RESET_TTL_MINUTES} минут):\n${link}\n\n` +
            `Agar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring. / Если вы не запрашивали — проигнорируйте письмо.`,
        });
      } catch (err) {
        console.error('password reset mail failed:', err.message);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /auth/reset — consume a token and set a new password.
router.post('/reset', resetLimiter, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { token, password } = req.body ?? {};
    if (!isStr(token) || !token || token.length > 128) return bad(res, 'Invalid or expired link.');
    const problem = passwordProblem(password);
    if (problem) return bad(res, problem);

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE password_resets SET used_at = now()
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
        RETURNING user_id`,
      [hashToken(token)]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired link.' } });
    }
    await client.query(`UPDATE users SET password_hash = $2, token_version = token_version + 1 WHERE id = $1`, [rows[0].user_id, hash]);
    await client.query(`DELETE FROM password_resets WHERE user_id = $1`, [rows[0].user_id]);
    await client.query('COMMIT');
    forgetSession(rows[0].user_id);
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
