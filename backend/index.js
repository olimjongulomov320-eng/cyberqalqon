require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const setup = require('./setup');

const authRouter        = require('./routes/auth');
const pathsRouter       = require('./routes/paths');
const modulesRouter     = require('./routes/modules');
const reviewRouter      = require('./routes/review');
const leaderboardRouter = require('./routes/leaderboard');
const usersRouter       = require('./routes/users');

const app = express();

// Render terminates TLS at its edge proxy, so the socket address is the proxy's.
// Trust exactly one hop to recover the real client IP for rate limiting.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '16kb' }));

app.use('/v1/auth',        authRouter);
app.use('/v1/paths',       pathsRouter);
app.use('/v1/modules',     modulesRouter);   // per-route limiters live inside
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
        <li><a style="color:#38bdf8" href="/v1/leaderboard?period=week">/v1/leaderboard?period=week</a> — weekly league</li>
        <li><a style="color:#38bdf8" href="/v1/modules/intro-to-networking">/v1/modules/intro-to-networking</a> — sample module</li>
      </ul>
    </body></html>
  `);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } });
});

const PORT = process.env.PORT || 3001;

// Auto-setup DB tables then start server
setup()
  .then(() => app.listen(PORT, () => console.log(`CyberQalqon API running on port ${PORT}`)))
  .catch(err => { console.error('Setup failed:', err); process.exit(1); });
