# API Overview

Base URL: `http://localhost:8080/api`

## Auth
- `POST /auth/register`
- `POST /auth/login`

## Users
- `GET /users/me`
- `PUT /users/me` — update own full name / phone
- `PUT /users/me/password` — change password
- `GET /users?role=TECHNICIAN`
- `GET /users/{id}`
- `POST /users` — ADMIN staff provisioning (non-CUSTOMER roles)
- `PUT /users/{id}`
- `DELETE /users/{id}`

## Customers
- `GET /customers`
- `GET /customers/available-portal-users` — unlinked CUSTOMER logins (ADMIN/MANAGER)
- `GET /customers/{id}`
- `GET /customers/{id}/work-orders`
- `POST /customers`
- `PUT /customers/{id}`
- `PUT /customers/{id}/portal-user` — link portal login
- `DELETE /customers/{id}/portal-user` — unlink portal login
- `DELETE /customers/{id}`

## Technicians
- `GET /technicians`
- `GET /technicians/{id}`
- `GET /technicians/{id}/work-orders`
- `POST /technicians` — link existing TECHNICIAN user
- `POST /technicians/with-account` — create login + technician profile together
- `PUT /technicians/{id}`
- `POST /technicians/{id}/availability`
- `DELETE /technicians/{id}`

## Work Orders
- `GET /work-orders`
- `GET /work-orders/{id}`
- `POST /work-orders`
- `PUT /work-orders/{id}`
- `POST /work-orders/{id}/assign`
- `POST /work-orders/{id}/schedule`
- `POST /work-orders/{id}/status`
- `POST /work-orders/{id}/complete`
- `POST /work-orders/{id}/cancel`
- `DELETE /work-orders/{id}`
- `GET|POST /work-orders/{id}/time-logs`
- `GET|POST /work-orders/{id}/parts`
- `GET|POST /work-orders/{id}/attachments`
- `GET /work-orders/{id}/attachments/{attachmentId}/download`
- `DELETE /work-orders/{id}/attachments/{attachmentId}`

Responses include `slaDueAt` and `slaStatus` (`ON_TRACK` | `AT_RISK` | `BREACHED` | `MET`).
Technicians cannot set status to `CANCELLED`.

## Invoices
- Out of scope per KEYSTONE spec.
- `/api/invoices/*` endpoints are intentionally disabled (return 404/410 via `ResourceNotFoundException`).

## Notifications
- `GET /notifications`
- `GET /notifications/unread-count`
- `POST /notifications/{id}/read`
- `POST /notifications/read-all`

## Customer Portal (CUSTOMER role)
- `GET /portal/requests` — list own service requests
- `GET /portal/requests/{id}` — get one own request
- `POST /portal/requests` — create a new request (becomes a work order)
- `GET /portal/invoices` — static out-of-scope notice (invoicing disabled)

## Schedules
- `GET /schedules?from=&to=`
- `GET /schedules/{id}`
- `POST /schedules`
- `PUT /schedules/{id}`
- `DELETE /schedules/{id}`

## Inventory
- `GET /inventory`
- `GET /inventory/low-stock`
- `GET /inventory/{id}`
- `POST /inventory`
- `PUT /inventory/{id}`
- `POST /inventory/{id}/stock-in`
- `POST /inventory/{id}/stock-out`
- `DELETE /inventory/{id}`

## Reports
- `GET /reports/dashboard` — ADMIN, MANAGER, DISPATCHER
- `GET /reports/work-orders`
- `GET /reports/technicians`
- `GET /reports/customers`
- `GET /reports/inventory`
