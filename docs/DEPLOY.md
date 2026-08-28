# Deploy KEYSTONE (Live URLs for Submission)

This guide deploys **frontend + backend + PostgreSQL** to [Render](https://render.com) (free tier).

## What you get

| Service | Render name | URL |
|---------|-------------|-----|
| Frontend (React) | `keystone-web` | `https://keystone-web.onrender.com` |
| Backend (Spring Boot) | `keystone-api` | `https://keystone-api.onrender.com` |
| Swagger UI | — | `https://keystone-api.onrender.com/swagger-ui.html` |
| PostgreSQL | `keystone-db` | internal only |

> Free Render web services **sleep after ~15 min idle**. First request after sleep may take 30–60 seconds.

## Prerequisites

1. [GitHub](https://github.com) account
2. [Render](https://render.com) account (sign in with GitHub)

## Step 1 — Push code to GitHub

From the project root:

```bash
git add -A
git commit -m "Prepare KEYSTONE for production deployment"
```

Create a new GitHub repo (via github.com → **New repository**), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/keystone-platform.git
git push -u origin main
```

## Step 2 — Deploy on Render

1. Open [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub account and select the `keystone-platform` repo
4. Render reads `render.yaml` and creates:
   - PostgreSQL database
   - Backend Docker service
   - Frontend static site
5. Click **Apply** and wait ~10–15 minutes for the first build

## Step 3 — Verify live deployment

1. Open your frontend URL (e.g. `https://keystone-web.onrender.com`)
2. Log in with demo account:
   - **Admin:** `admin@keystone.local` / `password123`
   - **Customer:** `customer@keystone.local` / `password123`
3. Check API health: `https://keystone-api.onrender.com/api/health`
4. Check Swagger: `https://keystone-api.onrender.com/swagger-ui.html`

Demo data is seeded automatically on first startup when the database is empty.

## Step 4 — Submit these URLs

Include in your internship submission:

```
Live App:    https://keystone-web.onrender.com
Live API:    https://keystone-api.onrender.com
Swagger:     https://keystone-api.onrender.com/swagger-ui.html
GitHub Repo: https://github.com/YOUR_USERNAME/keystone-platform
```

## Environment variables (already in render.yaml)

| Variable | Service | Purpose |
|----------|---------|---------|
| `SPRING_PROFILES_ACTIVE=prod` | API | Production config |
| `JWT_SECRET` | API | Auto-generated secure JWT key |
| `APP_SEED_DEMO=true` | API | Seed demo users on empty DB |
| `DB_HOST/PORT/NAME/USER/PASSWORD` | API | From Render Postgres |
| `VITE_API_BASE_URL` | Web | Points to API URL at build time |

## Troubleshooting

**Frontend loads but login fails**
- Wait for backend to finish starting (check Render logs for `Started BackendApplication`)
- Confirm `VITE_API_BASE_URL` on the web service points to the API URL

**CORS errors**
- Production uses `https://*.onrender.com` origin patterns automatically

**Backend build fails**
- Check Render logs; ensure Java 21 Docker build completes

**Database connection fails**
- Confirm all `DB_*` env vars are linked to `keystone-db` in Render dashboard

## Alternative: Docker Compose (VPS)

For a VPS with Docker:

```bash
docker compose up -d --build
```

Frontend must be built separately and served via nginx, or run locally pointing to the VPS API.
