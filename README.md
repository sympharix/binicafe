# RMS App — Restaurant Management

Sample app: restaurant management (orders, menu, tables, kitchen display). Frontend and backend connected with JWT auth.

## Structure

```
rms-app/
├── frontend/     # Vite + React (Tailwind), connected to backend
├── backend/      # Express + Prisma + SQLite
└── README.md
```

## Quick Start

1. **Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma generate && npx prisma db push
   node prisma/seed.js
   npm run dev
   ```
   Runs at http://localhost:3000

2. **Frontend**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Runs at http://localhost:5174

3. **Login:** admin@rms.local / admin123

## Frontend

- **Stack:** Vite, React 18, React Router, Tailwind CSS, Lucide icons
- **Auth:** JWT, protected routes, login/logout
- **API:** Branches, orders, analytics, menu, tables, kitchen

## Backend

See `backend/README.md` for services, API, and env vars.

## Deploy (BiniHost Fleet)

- **Docker Compose:** `docker-compose.yml` (repo root) — Fleet-optimized: published images only, 256Mi/512Mi limits, health checks, DB internal.
- **Production image:** `backend/Dockerfile` — multi-stage, non-root, health check.
- **Env:** Copy `.env.fleet.example` to `.env` and set `POSTGRES_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`.
- **Full steps:** See [docs/FLEET_DEPLOY.md](docs/FLEET_DEPLOY.md) (build, push, deploy).
