/**
 * Minimal transactional mailer with no dependency: the Resend HTTP API via
 * fetch. Configure with RESEND_API_KEY and MAIL_FROM (a verified sender).
 *
 * - Configured: sends for real.
 * - Not configured, development: prints the message to the console so the flow
 *   can be exercised locally.
 * - Not configured, production: reports "not sent" so callers can say so
 *   honestly instead of pretending a mail went out.
 */
const IS_PROD = () => process.env.NODE_ENV === 'production';

function isMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

/** True when a send is possible at all (real provider, or dev console). */
function canSendMail() {
  return isMailConfigured() || !IS_PROD();
}

async function sendMail({ to, subject, text }) {
  if (!isMailConfigured()) {
    if (IS_PROD()) return false;
    console.log(`[mail:dev] to=${to} subject=${subject}\n${text}`);
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`mail provider responded ${res.status}`);
  return true;
}

module.exports = { sendMail, canSendMail, isMailConfigured };
