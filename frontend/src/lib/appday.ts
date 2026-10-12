/**
 * The application day key (AUD-08).
 *
 * Daily goals, streaks and the review cap reset at midnight in the application
 * timezone (Asia/Tashkent), not at the device's local midnight. Hearts are a
 * client-only cosmetic, but they must reset on the same boundary or the UI
 * disagrees with the server for up to five hours every day.
 */
export const APP_TZ = 'Asia/Tashkent';

/** yyyy-mm-dd in the application timezone for the given instant. */
export function appDayKey(now: Date = new Date()): string {
  try {
    // en-CA formats as yyyy-mm-dd.
    return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ }).format(now);
  } catch {
    // Very old runtime without IANA tz support: fall back to the device's day.
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${m}-${d}`;
  }
}
