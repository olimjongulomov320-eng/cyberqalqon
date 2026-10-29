/**
 * Feature flags read at build time (static export). Set them in the build
 * environment, e.g. in .github/workflows/deploy-pages.yml or .env.local.
 */

/** Hearts/lives: a wrong answer costs a heart. Off by default; set NEXT_PUBLIC_HEARTS_ENABLED=true to turn it on. */
export const HEARTS_ENABLED = process.env.NEXT_PUBLIC_HEARTS_ENABLED === 'true';
