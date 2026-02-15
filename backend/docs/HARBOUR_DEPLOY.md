# Deploy RMS Backend on BiniHost (Harbour)

Follow the official guide first: **[BiniHost Harbour Guide](https://binihost.com/docs/harbour-guide)**.

This doc summarizes what the RMS backend needs so you can match it to Harbour’s steps.

---

## 1. Repository / source

- Use the **backend** folder as the app root, or point Harbour at the repo and set **root directory** to `rms-app/backend` (or wherever your `package.json` and `Dockerfile` live).

## 2. Build & run

**If Harbour uses Docker (recommended):**

- **Dockerfile:** `./Dockerfile` in the backend root.
- **Build:** No extra build command; image build runs `prisma generate` and installs deps.
- **Start:** `node src/index.js` (default `CMD` in Dockerfile).
- **Port:** App listens on `process.env.PORT` (default `3000`). Set **PORT** in Harbour to match what they assign (e.g. `3000`).

**If Harbour runs Node without Docker:**

- **Install:** `npm ci` or `npm install`.
- **Build:** `npm run build` (runs `prisma generate`).
- **Start:** `npm start` → `node src/index.js`.
- Ensure **PORT** is set (and **HOST=0.0.0.0** if required).

## 3. Environment variables

Set these in BiniHost/Harbour’s environment / config:

| Variable        | Required | Example / notes |
|----------------|----------|------------------|
| `PORT`         | Yes*     | `3000` (or value Harbour gives you) |
| `NODE_ENV`     | No       | `production` |
| `DATABASE_URL` | Yes      | `postgresql://user:password@host:5432/rms?schema=public` (use Harbour or external Postgres) |
| `JWT_SECRET`   | Yes      | Long random string for production |
| `JWT_EXPIRES_IN` | No    | `7d` |
| `CORS_ORIGINS` | Yes      | Your frontend URL(s), comma-separated, e.g. `https://your-app.binihost.com,https://www.yourdomain.com` |
| `AI_ENABLED`   | No       | `false` (or `true` if using AI) |
| `OPENAI_API_KEY` | No     | If `AI_ENABLED=true` |

\* Many hosts inject `PORT`; if not, set it explicitly.

## 4. Database (PostgreSQL)

- The app uses **Prisma** and **PostgreSQL**.
- In Harbour (or linked service), create a Postgres DB and set **DATABASE_URL**.
- After first deploy, run migrations (if Harbour allows a one-off command or shell):
  - `npx prisma migrate deploy`  
  or, for a fresh DB without migrations:
  - `npx prisma db push`
- Optional: run seed: `node prisma/seed.js` (if you have seed data).

## 5. Health check

- **Path:** `GET /health`  
- Use this in Harbour as the health-check URL so the platform knows the app is up.

## 6. Quick checklist

1. Follow [BiniHost Harbour Guide](https://binihost.com/docs/harbour-guide).
2. Point Harbour at this backend (repo + root directory if needed).
3. Set **PORT** (if required), **DATABASE_URL**, **JWT_SECRET**, **CORS_ORIGINS**.
4. Use Docker build with the provided **Dockerfile**, or Node build + `npm run build` and `npm start`.
5. Run Prisma migrations (or `db push`) against the deployed DB.
6. Set health check to `/health`.

After that, your API base URL will be the URL Harbour assigns (e.g. `https://your-backend.binihost.com`). Point your frontend’s `VITE_API_URL` (or equivalent) to that URL (e.g. `https://your-backend.binihost.com/api` if the app is mounted at `/api`).
