const { Pool } = require('pg');
const { APP_TZ } = require('./lib/time');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
});

// Pin the session timezone so any incidental bare CURRENT_DATE / now()::date
// aligns with the application day boundary (AUD-08). The explicit fragments in
// lib/time.js remain the authority; this is belt-and-suspenders for future code.
// Set per connection with SET rather than the `options` startup parameter:
// connection poolers such as Supabase's Supavisor reject startup options.
// APP_TZ is a constant from lib/time, never user input.
pool.on('connect', client => {
  client.query(`SET TIME ZONE '${APP_TZ}'`).catch(err => {
    console.error('Could not set session timezone:', err.message);
  });
});

module.exports = pool;
