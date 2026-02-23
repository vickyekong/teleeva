# MedConnect — API Endpoints (Contract)

**Use an API service layer in the app; do not hardcode business logic in UI.**  
Base URL: `process.env.NEXT_PUBLIC_API_URL` or your backend origin.

---

## 1. Auth (extend existing login UI)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login; returns token and user (including role) |
| POST | `/api/auth/register` | Register patient or provider |
| GET  | `/api/auth/me`     | Current user (requires auth) |
| POST | `/api/auth/logout` | Invalidate session |

---

## 2. Patient module

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/patients/me` | Current patient profile |
| PATCH  | `/api/patients/me` | Update profile |
| GET    | `/api/patients/me/medical-history` | Medical history list |
| POST   | `/api/patients/me/medical-history` | Add record (admin/doctor) |
| GET    | `/api/patients/me/emergency-contacts` | Emergency contacts |
| POST   | `/api/patients/me/emergency-contacts` | Add contact |
| GET    | `/api/patients/me/hmo` | HMO profile(s) |
| POST   | `/api/patients/me/hmo` | Link HMO |
| GET    | `/api/patients/me/prescriptions` | Prescription list |
| GET    | `/api/patients/me/treatment-requests` | Nurse visit requests |

---

## 3. AI diagnosis (service layer — no hardcoded logic in UI)

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/diagnosis/analyze` | Submit symptoms; returns AI preliminary diagnosis, risk level, suggested medications |
| GET    | `/api/diagnosis/requests` | List diagnosis requests (patient: own; pharmacist: queue) |
| GET    | `/api/diagnosis/requests/:id` | Single request details |

**Request body (analyze):** `{ symptoms: string, sessionId?: string }`  
**Response:** `{ requestId, riskLevel, confidence, conditions[], medications[], disclaimer }`

---

## 4. Pharmacist workflow

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/pharmacist/queue` | Pending diagnosis/prescription reviews |
| GET    | `/api/pharmacist/prescriptions` | Prescriptions (any status) |
| POST   | `/api/pharmacist/prescriptions/:id/approve` | Approve prescription |
| PATCH  | `/api/pharmacist/prescriptions/:id` | Modify prescription |
| POST   | `/api/pharmacist/prescriptions/:id/escalate` | Escalate to doctor |
| POST   | `/api/pharmacist/prescriptions/:id/dispatch` | Trigger medication dispatch |

---

## 5. Nurse / medical staff

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/nurse/jobs` | Assigned and available jobs |
| GET    | `/api/nurse/jobs/:id` | Job detail (patient location, summary) |
| POST   | `/api/nurse/jobs/:id/accept` | Accept job |
| PATCH  | `/api/nurse/jobs/:id/status` | Update status (en_route, in_progress, completed) |
| GET    | `/api/nurse/earnings` | Earnings summary |

---

## 6. Pharmacy & dispatch

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/pharmacy/orders` | Orders for pharmacy |
| GET    | `/api/pharmacy/inventory` | Drug inventory (structure) |
| PATCH  | `/api/pharmacy/orders/:id` | Update order status |
| GET    | `/api/dispatch/deliveries` | Delivery list |
| PATCH  | `/api/dispatch/deliveries/:id` | Update delivery status (e.g. in_transit, delivered) |

---

## 7. Emergency

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/emergency/alert` | One-click emergency; body: `{ lat, lng?, address?, patientId? }`; server notifies admin and emergency contacts |
| GET    | `/api/emergency/alerts` | List alerts (admin / emergency role) |
| PATCH  | `/api/emergency/alerts/:id` | Acknowledge or resolve (admin) |

---

## 8. Provider management

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/providers/register` | Onboard provider (hospital, pharmacy, nurse, pharmacist, etc.) |
| GET    | `/api/providers/me` | Current provider profile |
| PATCH  | `/api/providers/me` | Update profile |
| GET    | `/api/providers` | List providers (marketplace; optional filters) |
| PATCH  | `/api/admin/providers/:id/verify` | Set verification status (admin) |

---

## 9. Admin control center

| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/admin/requests` | Active medical/diagnosis/treatment requests |
| GET    | `/api/admin/emergencies` | Emergency alerts |
| GET    | `/api/admin/providers` | Provider list and verification status |
| GET    | `/api/admin/analytics` | System analytics (counts, trends) |
| GET    | `/api/admin/users` | User management (role-based) |
| PATCH  | `/api/admin/users/:id` | Update user (e.g. role, status) |

---

## 10. Audit & security

| Method | Path | Description |
|--------|------|-------------|
| POST   | (internal) | Log sensitive actions to audit_logs (server-side) |
| -      | All API | Use HTTPS; auth header (Bearer); role checks per route |

---

## Implementation note

- Implement these in your backend; frontend uses `src/services/api/` and `src/modules/*/services.ts` to call them.
- Keep AI diagnosis logic in the API (or dedicated AI service), not in the client.
