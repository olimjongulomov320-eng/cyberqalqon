const path = require('path');

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  // Aggressive front-end nav caching also caches the JS/CSS a page references,
  // which can leave visitors on assets from a previous deploy after a release.
  // Default navigations already use NetworkFirst, so keep offline nav support
  // (cacheOnFrontEndNav) but drop the aggressive asset grabbing.
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  // The default cross-origin rule caches every GET to the API by URL alone, so
  // a slow response (a sleeping host) could be answered from another user's
  // cached data. API traffic must always hit the network.
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/v1/') || url.hostname.endsWith('onrender.com'),
        handler: 'NetworkOnly',
      },
    ],
  },
  disable: process.env.NODE_ENV === 'development',
});

// Public API base. Priority:
//   1. NEXT_PUBLIC_API_URL (set this in Netlify to override)
//   2. production default -> the Render API created by render.yaml
//   3. local development -> http://localhost:3001 (matches backend/index.js)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://cyberqalqon-api.onrender.com'
    : 'http://localhost:3001');

// GitHub Pages serves a project site under `/<repo>/`, so the app must be built
// with that prefix. Empty in dev and on root-domain hosts (e.g. Netlify/Vercel),
// so nothing else changes.
const BASE_PATH = process.env.BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export: no Node server at runtime (GitHub Pages is static-only).
  // Every route must therefore be prerenderable — see
  // `src/app/modules/[slug]/page.tsx` for the one dynamic route.
  output: 'export',
  // Emit `/learn/index.html` instead of `/learn.html` so GitHub Pages resolves
  // extensionless URLs consistently.
  trailingSlash: true,
  basePath: BASE_PATH || undefined,
  images: {
    // No image optimization server in a static export.
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
    NEXT_PUBLIC_HEARTS_ENABLED: process.env.NEXT_PUBLIC_HEARTS_ENABLED || 'false',
    // Exposed so hand-written URLs (public assets, the web manifest) can be
    // prefixed the same way Next prefixes its own routes and `_next` assets.
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);
