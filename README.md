# cyberqalqon
Learn cybersecurity and AI's more deeper

> **Start here:** the full product concept — vision, audience, core loop,
> design language and architecture — lives in **[CONCEPT.md](CONCEPT.md)**.

## Local development

```bash
# 1. Backend (Postgres required — see backend/.env.example for DATABASE_URL)
cd backend
cp .env.example .env        # fill in DATABASE_URL + JWT_SECRET
npm install
npm run dev                 # starts on http://localhost:3001 (PORT env overrides)

# 2. Frontend (in a second terminal)
cd frontend
cp .env.example .env.local  # optional; defaults already point at :3001
npm install
npm run dev                 # http://localhost:3000
```

The frontend calls the API at `http://localhost:3001` in development
(`frontend/next.config.js`), which matches the backend default port
(`backend/index.js`). In production the frontend falls back to the Render API
(`https://cyberqalqon-api.onrender.com`); override with `NEXT_PUBLIC_API_URL` if needed.

## Deployment

- **Frontend → GitHub Pages** (project site under `/cyberqalqon/`):
  `.github/workflows/deploy-pages.yml` builds `frontend/` as a static export on
  every push to `main` that touches `frontend/`, and can be run manually via
  `workflow_dispatch`.
- **Backend → Render:** `render.yaml` provisions the API + Postgres together. The
  server reseeds the curriculum on start (`setup()`), so content ships with a
  normal deploy.
- **Order:** deploy the API first, then rebuild the frontend — the module list is
  fetched at build time, so a frontend rebuild before the API update freezes a
  stale module list.
- Live: <https://olimjongulomov320-eng.github.io/cyberqalqon/> 
