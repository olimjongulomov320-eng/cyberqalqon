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

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
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
