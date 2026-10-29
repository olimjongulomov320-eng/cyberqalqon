require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const setup = require('./setup');
const pool = require('./db');

const authRouter        = require('./routes/auth');
const pathsRouter       = require('./routes/paths');
const modulesRouter     = require('./routes/modules');
const problemsRouter    = require('./routes/problems');
const reviewRouter      = require('./routes/review');
const hintsRouter       = require('./routes/hints');
const leaderboardRouter = require('./routes/leaderboard');
const usersRouter       = require('./routes/users');
const tracksRouter      = require('./routes/tracks');

const IS_PROD = process.env.NODE_ENV === 'production';

// Fail fast on unsafe configuration instead of 500-ing on the first login.
if (!process.env.JWT_SECRET || (IS_PROD && process.env.JWT_SECRET.length < 32)) {
  console.error('Refusing to start: JWT_SECRET is missing' + (IS_PROD ? ' or shorter than 32 characters.' : '.'));
  process.exit(1);
}
if (IS_PROD && !process.env.CORS_ORIGIN) {
  console.error('Refusing to start: CORS_ORIGIN must be set in production.');
  process.exit(1);
}

const app = express();

// Render terminates TLS at its edge proxy, so the socket address is the proxy's.
// Trust exactly one hop to recover the real client IP for rate limiting.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  // Comma-separated allow-list; open only in local development.
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : '*',
}));
app.use(express.json({ limit: '16kb' }));

// Liveness + DB reachability, for uptime monitors (unlike '/', it fails when the DB is down).
app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// Coarse per-IP ceiling for the whole API; stricter limiters sit on top of it.
app.use('/v1', rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } }),
}));

app.use('/v1/auth',        authRouter);
app.use('/v1/paths',       pathsRouter);
app.use('/v1/tracks',      tracksRouter);
app.use('/v1/modules',     modulesRouter);   // per-route limiters live inside
app.use('/v1/modules',     hintsRouter);     // POST /:slug/hint (shares the path)
app.use('/v1/problems',    problemsRouter);  // read-only view over the curriculum
app.use('/v1/review',      reviewRouter);
app.use('/v1/leaderboard', leaderboardRouter);
app.use('/v1/users',       usersRouter);

// Simple status page so you can confirm it's running in a browser
app.get('/', (_req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;padding:2rem;background:#0f172a;color:#e2e8f0">
      <h1>🛡️ CyberQalqon API</h1>
      <p>Server is running. Try these endpoints:</p>
      <ul>
        <li><a style="color:#38bdf8" href="/v1/paths">/v1/paths</a> — learning paths</li>
        <li><a style="color:#38bdf8" href="/v1/modules">/v1/modules</a> — list all modules</li>
        <li><a style="color:#38bdf8" href="/v1/problems?limit=5">/v1/problems</a> — problem arena</li>
        <li><a style="color:#38bdf8" href="/v1/leaderboard?period=week">/v1/leaderboard?period=week</a> — weekly league</li>
        <li><a style="color:#38bdf8" href="/v1/modules/intro-to-networking">/v1/modules/intro-to-networking</a> — sample module</li>
      </ul>
    </body></html>
  `);
});

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
});

app.use((err, _req, res, _next) => {
  // Client mistakes (malformed JSON, oversized body) are 4xx, not server faults.
  const status = Number.isInteger(err?.status) ? err.status : 500;
  if (status >= 400 && status < 500) {
    return res.status(status).json({
      error: { code: err.type === 'entity.parse.failed' ? 'INVALID_JSON' : 'BAD_REQUEST', message: 'Invalid request.' },
    });
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } });
});

const PORT = process.env.PORT || 3001;

// Auto-setup DB tables then start server
setup()
  .then(() => app.listen(PORT, () => console.log(`CyberQalqon API running on port ${PORT}`)))
  .catch(err => { console.error('Setup failed:', err); process.exit(1); });
