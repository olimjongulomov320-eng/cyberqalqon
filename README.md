# cyberqalqon
Learn cybersecurity and AI's more deeper

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
