# Keystone Platform

Enterprise Field Service Management Platform for commercial facilities.

## Features

- JWT authentication with role-based access (ADMIN, MANAGER, DISPATCHER, TECHNICIAN, CUSTOMER)
- Public registration is CUSTOMER-only; staff accounts are provisioned by ADMIN
- Customer management
- Technician management and availability
- Work order lifecycle (create → assign → schedule → in progress → complete)
- Technician field board (`/field`) for today’s jobs
- Weekly schedule calendar with reschedule and conflict detection
- SLA compliance monitoring (due windows by priority; ON_TRACK / AT_RISK / BREACHED / MET)
- Customer self-service portal (`/portal`) for request submit and status tracking
- Inventory stock in/out with low-stock detection
- Live operational dashboard and reports
- Time tracking, parts usage, and in-app notifications (status, schedule, SLA, portal)
- Work order file attachments (photos/PDFs)
- Invoicing is out of scope per KEYSTONE spec (invoice endpoints/UI disabled)
- Admin Users page for staff provisioning

## Technology Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Java 21
- Spring Boot 4.0.7
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL 16 (compatible)

## Architecture

```
┌─────────────┐       ┌────────────────────┐       ┌────────────┐
│  React SPA  │──────▶│  Spring Boot API   │──────▶│ PostgreSQL │
│  (Vite)     │  REST │  (JWT + RBAC)      │  JPA  │            │
└─────────────┘       └────────────────────┘       └────────────┘
```

- **Frontend**: Single-page React application with role-aware routing and Tailwind CSS.
- **Backend**: Layered architecture (Controller → Service → Repository → Entity). DTOs enforce boundary separation. Flyway manages schema migrations.
- **Security**: Stateless JWT with per-endpoint `@PreAuthorize` role checks.
- **SLA Engine**: Scheduled task monitors due dates and pushes in-app notifications.

## API Documentation (Swagger UI)

Once the backend is running, open:

```
http://localhost:8080/swagger-ui.html
```

Full OpenAPI spec is also available at `/v3/api-docs`.

## Project Structure

```
keystone platform/
  frontend/     React app (port 5173)
  backend/      Spring Boot API (port 8080)
  database/     DB notes/scripts
  docs/         Documentation
```

## Prerequisites

- Node.js 20+
- Java 21
- PostgreSQL 17 with database `keystone_db`

## Environment Configuration

### Backend

Copy the local config example:

```bash
copy backend\src\main\resources\application-local.properties.example backend\src\main\resources\application-local.properties
```

Set at least:

```properties
spring.datasource.password=your_postgres_password
app.jwt.secret=KeystoneDevSecretKeyMustBeAtLeast32CharsLong!
```

Or use environment variables:

- `DB_PASSWORD`
- `JWT_SECRET`
- `DB_URL` (optional)
- `DB_USERNAME` (optional)

`application-local.properties` is gitignored.

### Frontend

Optional:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Database Setup

1. Install PostgreSQL 17
2. Create database:

```sql
CREATE DATABASE keystone_db;
```

3. Start the backend — Flyway runs migrations to create the schema

## Running the Backend

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

API base: `http://localhost:8080/api`

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Authentication

Public endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

All other business APIs require `Authorization: Bearer <token>`.

### Example register payload

Public registration always creates a CUSTOMER portal account:

```json
{
  "fullName": "Site Contact",
  "email": "customer@example.com",
  "password": "password123",
  "phoneNumber": "555-0100",
  "role": "CUSTOMER"
}
```

Staff accounts are created by an ADMIN via `POST /api/users`.

### Roles

| Role | Access |
|------|--------|
| ADMIN | Full access; provisions staff users |
| MANAGER | Customers, technicians, work orders, inventory, reports |
| DISPATCHER | Customers, technicians, work orders, scheduling |
| TECHNICIAN | Field board, assigned work orders, own schedule, status updates (no cancel) |
| CUSTOMER | Portal self-service only |

## Suggested End-to-End Demo Flow

Demo accounts (seeded automatically on first local startup when the users table is empty):

| Email | Password | Role |
|-------|----------|------|
| admin@keystone.local | password123 | ADMIN |
| manager@keystone.local | password123 | MANAGER |
| dispatcher@keystone.local | password123 | DISPATCHER |
| tech@keystone.local | password123 | TECHNICIAN |
| tech2@keystone.local | password123 | TECHNICIAN |
| tech3@keystone.local | password123 | TECHNICIAN |
| tech4@keystone.local | password123 | TECHNICIAN |
| customer@keystone.local | password123 | CUSTOMER |

1. Log in as **admin** — review dashboard, SLA cards, inventory catalog
2. Log in as **dispatcher** — assign / schedule a work order, add parts
3. Log in as **tech** — open `/field`, start → complete a job
4. Log in as **customer** — create a portal request and track status/SLA
5. Complete the job as a technician and confirm SLA + notifications update

## Visual identity

Keystone uses a distinctive **ink + teal** operations theme (Outfit + Source Sans 3), dark console sidebar, and brand-forward auth screens — not a generic blue admin template.

## Testing

Backend unit + API tests:

```bash
cd backend
.\mvnw.cmd test
```

Covers authentication, work-order status transitions, and inventory stock rules.
## API Overview

- Auth: `/api/auth/*`
- Users: `/api/users/*`
- Customers: `/api/customers/*`
- Technicians: `/api/technicians/*`
- Work Orders: `/api/work-orders/*` (time logs, parts, attachments)
- Schedules: `/api/schedules/*`
- Inventory: `/api/inventory/*`
- Invoices: out of scope (endpoints intentionally disabled)
- Notifications: `/api/notifications/*`
- Portal: `/api/portal/*` (customer requests only; invoices disabled)
- Reports: `/api/reports/*`

## Build Validation

Backend:

```bash
cd backend
.\mvnw.cmd clean compile
```

Frontend:

```bash
cd frontend
npm run build
```

## Deploy Live (Submission)

Deploy frontend + backend + PostgreSQL to Render using the included blueprint:

1. Push this repo to GitHub
2. In [Render](https://render.com) → **New** → **Blueprint** → select your repo
3. Apply `render.yaml` — creates API, web app, and database automatically

Full step-by-step guide: [docs/DEPLOY.md](docs/DEPLOY.md)

After deploy, submit your live URLs:

```
Live App:  https://keystone-web.onrender.com   (your Render frontend URL)
Live API:  https://keystone-api.onrender.com   (your Render backend URL)
Swagger:   https://keystone-api.onrender.com/swagger-ui.html
```

Demo logins work on the live site (`admin@keystone.local` / `password123`).

## Notes

- Passwords are hashed with BCrypt
- Work order numbers are auto-generated (`WO-2026-00001`)
- Invalid work order status transitions are rejected by the service layer
- Inventory quantity cannot go negative
