# Deploy RMS App to BiniHost Fleet

BiniHost Fleet is Kubernetes-based: use **published images** (no local build context). Build and push images first, then deploy with the provided `docker-compose.yml` and env.

---

## 1. Set your image registry

Replace `ghcr.io/YOUR_ORG` in `docker-compose.yml` with your registry:

- **GitHub Container Registry:** `ghcr.io/<github-username>/rms-backend` or `ghcr.io/<org>/rms-backend`
- **Docker Hub:** `docker.io/<username>/rms-backend`

---

## 2. Build and push the backend image

From the repo root (or `backend/` if you build from there):

```bash
# From repo root — backend image
cd backend
docker build -t ghcr.io/YOUR_ORG/rms-backend:latest .

# Log in to registry (pick one)
# GitHub:
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
# Docker Hub:
docker login -u YOUR_DOCKERHUB_USERNAME

# Push
docker push ghcr.io/YOUR_ORG/rms-backend:latest
```

Postgres uses the official `postgres:16-alpine` image; no build needed.

---

## 3. Environment variables

Copy the example and fill in secrets:

```bash
cp .env.fleet.example .env
# Edit .env: set POSTGRES_PASSWORD, JWT_SECRET, CORS_ORIGINS
```

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_PASSWORD` | Yes | DB password (used by `db` and in `DATABASE_URL` for `api`) |
| `JWT_SECRET` | Yes | Long random string (e.g. 32+ chars) for production |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `CORS_ORIGINS` | Yes | Comma-separated frontend URLs |
| `AI_ENABLED` | No | `false` or `true` |
| `OPENAI_API_KEY` | If AI | Set if `AI_ENABLED=true` |

In BiniHost Fleet UI you can set these as **shared** or **per-service** (e.g. only `api` needs `JWT_SECRET`, `CORS_ORIGINS`).

---

## 4. Fleet service types

- **api:** Web service — expose port 3000; public URL like `{app-slug}-api.binihost.app`.
- **db:** Internal — no public ports; `api` reaches it at hostname `db:5432`.

In Fleet, mark `db` as **internal** so it gets no public URL. Ensure `api` is **web** and gets a public URL.

---

## 5. Deploy on Fleet

1. Create a new Fleet app.
2. Use **docker-compose** and paste the contents of `docker-compose.yml` (with your image name and env).
3. Add the env vars (from `.env` or Fleet UI).
4. Deploy. Fleet will pull `ghcr.io/YOUR_ORG/rms-backend:latest` and `postgres:16-alpine`.

---

## 6. After first deploy — database schema

Run migrations (or push schema) against the deployed DB. Options:

- **Fleet “run once” / job:** run in the `api` image:
  - `npx prisma migrate deploy`
  - or `npx prisma db push` (no migration history)
- **Local (temporary):** Port-forward to `db` and run:
  - `DATABASE_URL="postgresql://rms:YOUR_POSTGRES_PASSWORD@localhost:5432/rms" npx prisma migrate deploy`

---

## 7. Health checks

- **api:** `GET /health` (already in Dockerfile and compose).
- **db:** `pg_isready -U rms -d rms` (in compose).

Fleet can use these for liveness/readiness.

---

## 8. Memory (Fleet constraints)

- **api:** 256Mi limit (128Mi reservation) in compose; adjust in Fleet if needed.
- **db:** 512Mi limit (256Mi reservation).

All set in `docker-compose.yml` under `deploy.resources`.
