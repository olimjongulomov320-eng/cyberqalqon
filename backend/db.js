const { Pool } = require('pg');
const { APP_TZ } = require('./lib/time');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  // Pin the session timezone so any incidental bare CURRENT_DATE / now()::date
  // aligns with the application day boundary (AUD-08). The explicit fragments in
  // lib/time.js remain the authority; this is belt-and-suspenders for future code.
  options: `-c timezone=${APP_TZ}`,
});

module.exports = pool;
