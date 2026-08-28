# Keystone Development Checklist

| Module | Status |
|--------|--------|
| Project foundation | COMPLETED |
| Authentication & JWT | COMPLETED |
| User management | COMPLETED |
| Customer management | COMPLETED |
| Technician management | COMPLETED |
| Work order management | COMPLETED |
| Scheduling | COMPLETED |
| Field technician ops | COMPLETED |
| Inventory | COMPLETED |
| Dashboard | COMPLETED |
| Reports | COMPLETED |
| Frontend-backend integration | COMPLETED |
| Automated tests | COMPLETED |
| Demo data seeder | COMPLETED |
| Profile page + UI polish | COMPLETED |
| Interactive dashboard charts | COMPLETED |
| Work order time tracking | COMPLETED |
| Work order parts usage | COMPLETED |
| In-app notifications | COMPLETED |
| SLA compliance monitoring | COMPLETED |
| Customer self-service portal | COMPLETED |
| Auth hardening (customer-only public register) | COMPLETED |
| Admin staff user provisioning | COMPLETED |
| Richer status / schedule / SLA notifications | COMPLETED |
| Technician field board (`/field`) | COMPLETED |
| Inventory & technician edit/deactivate UI | COMPLETED |
| Weekly schedule calendar + reschedule | COMPLETED |
| Technician create-with-account | COMPLETED |
| Work order attachments | COMPLETED |
| Invoicing from completed work orders | OUT OF SCOPE (endpoints disabled) |
| Admin Users page | COMPLETED |
| Portal invoices view | OUT OF SCOPE |
| Invoice print + detail status actions | OUT OF SCOPE |
| Invoice SENT → customer notification | OUT OF SCOPE |
| Demo seed: completed WO + SENT invoice | OUT OF SCOPE (schema coverage only) |
| Scheduled SLA monitor alerts | COMPLETED |
| Profile edit + password change | COMPLETED |
| Reports CSV export | COMPLETED |
| Attachment image previews | COMPLETED |
| Link customer ↔ portal user | COMPLETED |
| Dispatcher inventory access + catalog seed | COMPLETED |
| Final UI polish (Keystone identity system) | COMPLETED |

## SLA rules

| Priority | Due window |
|----------|------------|
| URGENT | 4 hours |
| HIGH | 24 hours |
| MEDIUM | 72 hours |
| LOW | 7 days |

Statuses: ON_TRACK, AT_RISK (<=25% time left), BREACHED, MET

## Customer portal

- Role: `CUSTOMER`
- Routes: `/portal`, `/portal/requests`, `/portal/requests/new`, `/portal/invoices`
- API: `/api/portal/requests`, `/api/portal/invoices`
- Register with role CUSTOMER creates linked customer profile

## Field technician

- Route: `/field` (TECHNICIAN home)
- Start / hold / complete jobs with large actions
- Details page for time logs, parts, and attachments

## Invoicing
- Out of scope per KEYSTONE spec.
- Backend `/api/invoices` and `/api/portal/invoices` endpoints are disabled (return 404/410 via `ResourceNotFoundException`).
- Frontend invoice screens are replaced with an "out of scope" message.

## SLA monitoring

- Due windows by priority; statuses ON_TRACK / AT_RISK / BREACHED / MET
- Activity-driven alerts plus scheduled scan every 5 minutes (`app.sla.monitor-interval-ms`)
- Alerts are deduped via `lastSlaAlertStatus` on each work order

## Auth notes

- Public `POST /api/auth/register` is CUSTOMER-only
- Staff users: `POST /api/users` (ADMIN) or Users page
- Technicians cannot cancel work orders via status API
- Dispatchers can create technicians via `/technicians/with-account`
