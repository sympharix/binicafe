# RMS App — Backend

Full backend for the Restaurant Management App: **Auth**, **Order**, **Inventory**, **Branch**, **Analytics**, **Notification**, and **AI** layer.

---

## Services

| Service | Responsibility |
|--------|----------------|
| **Auth** | Login, register, JWT, roles (ADMIN, MANAGER, WAITER, KITCHEN) |
| **Order** | Order lifecycle: create, status (pending → sent → preparing → ready → served), cancel |
| **Inventory** | Stock tracking, movements (IN/OUT/ADJUST), low-stock alerts |
| **Branch** | Multi-location: branches, categories, items, tables (CRUD) |
| **Analytics** | Reports: sales by period, dashboard stats, top items |
| **Notification** | Alerts: order ready, low stock; list, mark read |
| **AI** | Optional: sales insights, low-stock recommendations (OpenAI-compatible) |

---

## Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express
- **DB:** PostgreSQL (Prisma) — create DB: `CREATE DATABASE rms;`
- **Auth:** JWT (jsonwebtoken), bcrypt
- **Validation:** Zod

---

## Setup

1. **Create the database** (one-time, as postgres user):
   ```bash
   psql -U postgres -h localhost -c "CREATE DATABASE rms;"
   ```

2. **Configure and run:**
   ```bash
   cp .env.example .env
   # Edit .env if your postgres user/password/port differ
   npm install
   npx prisma generate
   npx prisma db push
   node prisma/seed.js
   npm run dev
   ```

Runs at **http://localhost:3000**

---

## API base: `/api`

### Auth (`/api/auth`)
- `POST /login` — body: `{ email, password }`
- `POST /register` — body: `{ email, password, name?, role?, branchId? }`
- `GET /profile` — Bearer token required

### Branches (`/api/branches`)
- `GET /` — list branches
- `GET /:id` — get branch
- `GET /:branchId/categories` — list categories
- `GET /:branchId/items` — list items (?categoryId=)
- `GET /:branchId/tables` — list tables
- `POST /:branchId/categories`, `PUT /:branchId/categories/:id`, `DELETE /:branchId/categories/:id`
- `POST /:branchId/items`, `PUT /:branchId/items/:id`, `PATCH /:branchId/items/:id/available`, `DELETE /:branchId/items/:id`
- `POST /:branchId/tables`, `PUT /:branchId/tables/:id`, `PATCH /:branchId/tables/:id/status`, `DELETE /:branchId/tables/:id`
- `POST /` — create branch (admin/manager)
- `PUT /:id` — update branch (admin/manager)

### Orders (`/api/orders`)
- `GET /` — list (?branchId= & tableId= & status=)
- `GET /:id` — get one
- `POST /` — create (body: tableId, notes?, items: [{ itemId, quantity, notes? }])
- `PATCH /:id/status` — body: `{ status }`
- `DELETE /:id` — cancel (pending only)

### Inventory (`/api/inventory`)
- `GET /` — list (?branchId=)
- `GET /low-stock` — items below min
- `GET /:id` — get one
- `POST /` — create
- `PUT /:id` — update
- `POST /:id/movement` — body: `{ type: IN|OUT|ADJUST, quantity, reason? }`

### Analytics (`/api/analytics`)
- `GET /sales` — query: branchId, from?, to?
- `GET /dashboard` — query: branchId, todayOnly?

### Notifications (`/api/notifications`)
- `GET /` — list (?branchId=, unreadOnly=)
- `PATCH /:id/read` — mark read
- `POST /read-all` — mark all read

### AI (`/api/ai`)
- `GET /status` — whether AI is enabled
- `POST /insights/sales` — body: sales data → insight
- `POST /insights/low-stock` — body: `{ items }` → recommendation

---

## Env

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 3000) |
| DATABASE_URL | PostgreSQL URL (e.g. `postgresql://postgres:PASSWORD@localhost:5432/rms`) |
| JWT_SECRET | Secret for JWT signing |
| JWT_EXPIRES_IN | Token expiry (e.g. 7d) |
| AI_ENABLED | Set `true` to enable AI endpoints |
| OPENAI_API_KEY | OpenAI API key for AI layer |
| CORS_ORIGINS | Comma-separated origins |

---

## Seed user

After `node prisma/seed.js`:

- **Email:** admin@rms.local  
- **Password:** admin123  
- **Role:** ADMIN  

Use for login and testing protected routes.
