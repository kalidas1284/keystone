# KEYSTONE — Field Service Management Platform
## Project Report

**Project Name:** KEYSTONE Field Service Management Platform  
**Developer:** [Your Name]  
**Date:** August 2026  
**GitHub Repository:** https://github.com/kalidas1284/keystone  
**Live Application:** https://keystone-web-vnzs.onrender.com  
**API Documentation:** https://keystone-api-za1v.onrender.com/swagger-ui.html  

---

## 1. Overview

### 1.1 Introduction

KEYSTONE is a full-stack **Field Service Management (FSM)** web application designed for commercial facilities operations. It enables organizations to manage customers, sites, technicians, work orders, scheduling, inventory, and SLA compliance from a single operations console. A dedicated **customer self-service portal** allows facility contacts to submit and track service requests without calling the dispatch desk.

The project was built as part of the Zidio Java internship specification, implementing core FSM features (F1–F9) with a production-ready deployment on Render.

### 1.2 Problem Statement

Commercial facility operators need to:

- Dispatch technicians to multiple customer sites efficiently  
- Track work order status from creation through completion  
- Monitor SLA deadlines by job priority  
- Manage parts inventory and labor time on each job  
- Give customers visibility into their open requests  

KEYSTONE addresses these needs with role-based workflows for admins, managers, dispatchers, technicians, and customers.

### 1.3 Key Features

| Module | Description |
|--------|-------------|
| **Authentication & RBAC** | JWT-based login with five roles: Admin, Manager, Dispatcher, Technician, Customer |
| **Customer & Site Management** | Customers with multiple building sites; paginated site lists |
| **Work Order Lifecycle** | NEW → ASSIGNED → SCHEDULED → IN_PROGRESS → COMPLETED → CLOSED (or CANCELLED) |
| **Technician Dispatch** | Assign technicians, schedule jobs, weekly calendar with conflict detection |
| **Field Operations** | Technician field board (`/field`) for mobile-friendly job actions |
| **SLA Monitoring** | Priority-based due windows; ON_TRACK, AT_RISK, BREACHED, MET statuses |
| **Time & Parts Tracking** | Log labor minutes and inventory parts per work order with roll-up totals |
| **Attachments** | Upload photos, PDFs, and documents (up to 10 MB) |
| **Inventory** | Stock levels, adjustments, low-stock alerts on dashboard |
| **Dashboard & Reports** | Live metrics, charts, technician/customer/site summaries, CSV export |
| **Customer Portal** | Submit requests, view status history (no internal cost data exposed) |
| **Notifications** | In-app alerts for status changes, scheduling, SLA breaches, portal requests |
| **API Documentation** | Swagger UI for all REST endpoints |

> **Note:** Invoicing and payment processing are intentionally **out of scope** per the KEYSTONE specification.

### 1.4 Target Users

| Role | Primary Use |
|------|-------------|
| **Admin** | Full system access, user provisioning, reports |
| **Manager** | Operations oversight, close work orders, reports |
| **Dispatcher** | Create/assign/schedule work orders, manage customers |
| **Technician** | Execute field jobs, log time and parts |
| **Customer** | Portal: submit and track service requests |

---

## 2. Tech Stack

### 2.1 Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Vite 8** | Build tool and dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing with role guards |
| **Axios** | HTTP client for REST API calls |
| **Chart.js** | Dashboard charts (status breakdown, workload) |
| **React Toastify** | User feedback notifications |

### 2.2 Backend

| Technology | Purpose |
|------------|---------|
| **Java 21** | Programming language |
| **Spring Boot 4.0.7** | Application framework |
| **Spring Security** | Authentication and authorization |
| **JWT (JSON Web Tokens)** | Stateless session management |
| **Spring Data JPA** | Object-relational mapping |
| **PostgreSQL 16** | Relational database |
| **Flyway** | Versioned database migrations |
| **SpringDoc OpenAPI 3** | Swagger API documentation |
| **BCrypt** | Password hashing |
| **Maven** | Build and dependency management |

### 2.3 Deployment & DevOps

| Technology | Purpose |
|------------|---------|
| **Docker** | Backend containerization |
| **Render** | Cloud hosting (API + static frontend + PostgreSQL) |
| **GitHub** | Source code repository and version control |
| **render.yaml** | Infrastructure-as-code blueprint |

### 2.4 Development Tools

- **Cursor IDE** — Development environment  
- **Git** — Version control  
- **JUnit + Mockito** — Backend unit and integration tests  
- **H2 Database** — In-memory DB for automated tests  

---

## 3. Architecture & Screenshots

### 3.1 System Architecture

KEYSTONE follows a classic **three-tier architecture**:

```
┌─────────────────┐     REST/JSON      ┌──────────────────────┐     JPA      ┌─────────────┐
│   React SPA     │ ─────────────────▶ │   Spring Boot API    │ ───────────▶ │ PostgreSQL  │
│   (Vite/TS)     │   JWT Bearer Token │   (Java 21)          │              │             │
│   Port 5173     │ ◀───────────────── │   Port 8080          │ ◀─────────── │  keystone_db│
└─────────────────┘                    └──────────────────────┘              └─────────────┘
        │                                         │
        │                                         │
   Role-based                              Layered backend:
   routing + UI                            Controller → Service
                                           → Repository → Entity
```

**Request flow:**
1. User interacts with the React single-page application  
2. Frontend sends authenticated HTTP requests to `/api/*` endpoints  
3. Spring Security validates JWT and checks role permissions (`@PreAuthorize`)  
4. Service layer enforces business rules (status transitions, SLA, immutability)  
5. JPA repositories persist data to PostgreSQL  
6. DTOs separate API responses from internal entity structure  

### 3.2 Backend Layer Structure

```
backend/src/main/java/com/keystone/platform/backend/
├── controller/     REST API endpoints (Auth, WorkOrder, Customer, Portal, Reports…)
├── service/        Business logic (WorkOrderService, PortalService, ReportService…)
├── repository/     Spring Data JPA interfaces
├── entity/         JPA domain models (WorkOrder, Customer, Site, Technician…)
├── dto/            Request/response data transfer objects
├── config/         Security, Flyway, demo data seeder
├── security/       JWT filter and user details service
└── exception/      Global exception handler (401, 403, 404, 409, 422)
```

### 3.3 Database Schema (Key Entities)

| Entity | Description |
|--------|-------------|
| `users` | Login accounts with role (ADMIN, MANAGER, DISPATCHER, TECHNICIAN, CUSTOMER) |
| `customers` | Commercial facility clients |
| `sites` | Physical locations belonging to a customer |
| `technicians` | Field workforce linked to user accounts |
| `work_orders` | Core job records with status, priority, SLA due date |
| `work_order_status_history` | Audit trail of every status change |
| `work_order_time_logs` | Labor minutes logged per job |
| `work_order_parts` | Inventory parts consumed per job |
| `work_order_attachments` | File uploads per job |
| `schedules` | Technician calendar entries |
| `inventory_items` | Parts catalog with stock quantities |
| `notifications` | In-app user notifications |

Schema is managed by **Flyway migrations** (`V1` baseline, `V2` legacy upgrade, `V3` customer role).

### 3.4 Security Model

- **Authentication:** `POST /api/auth/login` returns a signed JWT (24-hour expiry)  
- **Authorization:** Each endpoint protected by role via `@PreAuthorize("hasRole('ADMIN')")`  
- **Portal isolation:** Customer portal uses `PortalWorkOrderResponse` DTO — excludes internal costs, notes, and technician IDs  
- **Terminal immutability:** CLOSED/CANCELLED work orders cannot be edited; time/parts/attachments blocked  
- **CORS:** Configured for localhost (dev) and `*.onrender.com` (production)  

### 3.5 SLA Engine

| Priority | Due Window |
|----------|------------|
| URGENT | 4 hours |
| HIGH | 24 hours |
| MEDIUM | 72 hours |
| LOW | 7 days |

Statuses: **ON_TRACK** → **AT_RISK** (≤25% time remaining) → **BREACHED** (past due) → **MET** (completed on time)

A scheduled background task runs every 5 minutes to detect breaches and send notifications.

### 3.6 Screenshots

> **Instructions:** Replace the placeholders below with your actual screenshots before exporting to PDF.

#### Screenshot 1 — Login Page
![Login Page](screenshots/01-login.png)
*Figure 1: Keystone login screen with role-based access*

#### Screenshot 2 — Admin Dashboard
![Dashboard](screenshots/02-dashboard.png)
*Figure 2: Operations dashboard with live metrics, SLA cards, and charts*

#### Screenshot 3 — Work Order Details
![Work Order](screenshots/03-work-order.png)
*Figure 3: Work order with status, time tracking, parts, attachments, and status history*

#### Screenshot 4 — Technician Field Board
![Field Board](screenshots/04-field-board.png)
*Figure 4: Technician mobile-friendly field view for today's jobs*

#### Screenshot 5 — Customer Portal
![Customer Portal](screenshots/05-portal.png)
*Figure 5: Customer self-service portal — submit and track requests*

#### Screenshot 6 — Reports Page
![Reports](screenshots/06-reports.png)
*Figure 6: Operational reports with CSV export*

#### Screenshot 7 — Swagger API Documentation
![Swagger](screenshots/07-swagger.png)
*Figure 7: OpenAPI/Swagger UI documenting all REST endpoints*

---

## 4. Deployment

### 4.1 Live URLs

| Service | URL |
|---------|-----|
| **Web Application** | https://keystone-web-vnzs.onrender.com |
| **REST API** | https://keystone-api-za1v.onrender.com |
| **Swagger UI** | https://keystone-api-za1v.onrender.com/swagger-ui.html |
| **Health Check** | https://keystone-api-za1v.onrender.com/api/health |
| **GitHub Repository** | https://github.com/kalidas1284/keystone |

### 4.2 Demo Credentials

Password for all accounts: **`password123`**

| Role | Email |
|------|-------|
| Admin | admin@keystone.local |
| Manager | manager@keystone.local |
| Dispatcher | dispatcher@keystone.local |
| Technician | tech@keystone.local |
| Customer | customer@keystone.local |

### 4.3 Local Setup

```bash
# Backend
cd backend
.\mvnw.cmd spring-boot:run

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — API at http://localhost:8080/api

---

## 5. Conclusion

### 5.1 Summary

KEYSTONE successfully implements a production-grade Field Service Management platform covering the complete operational workflow: customer onboarding, work order creation, technician dispatch, field execution, SLA monitoring, inventory management, and customer self-service. The application demonstrates proficiency in full-stack Java web development with modern frontend practices, secure REST API design, and cloud deployment.

### 5.2 Achievements

- ✅ All core FSM features (F1–F9) implemented per specification  
- ✅ Five-role RBAC with JWT authentication  
- ✅ SLA engine with automated breach notifications  
- ✅ Customer portal with data isolation (no internal field leakage)  
- ✅ Live deployment on Render with PostgreSQL  
- ✅ Swagger API documentation  
- ✅ Automated backend tests (JUnit)  
- ✅ Flyway database migrations for reproducible schema  
- ✅ CSV report export  

### 5.3 Out of Scope (By Design)

- Invoicing and payment processing (per KEYSTONE spec)  
- Email/SMS external notifications (in-app only)  
- Mobile native app (responsive web UI used instead)  

### 5.4 Future Enhancements

- Email/SMS notification integration  
- Real-time WebSocket updates for dispatch board  
- GPS-based technician location tracking  
- Mobile PWA with offline support  
- Advanced analytics and predictive SLA modeling  

---

**End of Report**
