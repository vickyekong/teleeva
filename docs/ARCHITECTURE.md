# MedConnect — Scalable AI-Powered Healthcare Ecosystem Architecture

**Principle:** Extend the existing application. Do not remove or override existing UI, routing, styling, or workflows.

---

## 1. Current State Summary

### What Exists (Preserved)

| Area | Current Implementation |
|------|------------------------|
| **Stack** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, static export |
| **Routing** | `/`, `/patient-portal`, `/provider-portal`, `/ai-diagnosis`, `/subscribe`, `/patient/dashboard`, `/patient/nurse-request`, `/patient/prescriptions`, `/patient/reminders`, `/nurse`, `/doctor`, `/pharmacy`, `/pharmacist`, `/dispatch`, `/hmo`, `/marketplace`, `/marketplace/register`, `/login`, `/telemedicine`, `/security` |
| **UI** | MainLayout, Navbar, EmergencyButton, SubscriptionGate; healthcare palette (white, blue, green), `.bg-medical-gradient`, `.emergency-pulse` |
| **State** | Client-only: `lib/subscription.ts` (localStorage), no backend/DB yet |
| **Auth** | Login page (UI + role select); no persisted sessions |
| **Branding** | `lib/constants.ts`: BRAND_NAME, AI_NAME, USER_ROLES, RISK_LEVELS |

### Out of Scope for Removal

- Any existing page or route
- Existing components (layout, nav, emergency button, subscription gate)
- `globals.css` and Tailwind theme
- Current navigation flow (Speak to Eva → patient portal, Become a provider → provider portal)

---

## 2. Target Modular Architecture (Additive)

```
medconnect/
├── src/
│   ├── app/                          # [EXISTING] App Router pages — keep as-is
│   │   ├── page.tsx
│   │   ├── patient-portal/
│   │   ├── provider-portal/
│   │   ├── ai-diagnosis/
│   │   ├── patient/
│   │   ├── nurse/
│   │   ├── doctor/
│   │   ├── pharmacy/
│   │   ├── pharmacist/
│   │   ├── dispatch/
│   │   ├── hmo/
│   │   ├── marketplace/
│   │   ├── subscribe/
│   │   ├── login/
│   │   └── ...
│   │
│   ├── components/                   # [EXISTING] Shared UI — keep as-is
│   │   ├── layout/
│   │   ├── ui/
│   │   └── patient/
│   │
│   ├── modules/                      # [NEW] Modular feature layers
│   │   ├── patient/
│   │   │   ├── types.ts
│   │   │   ├── services.ts
│   │   │   └── hooks.ts              # optional
│   │   ├── pharmacist/
│   │   │   ├── types.ts
│   │   │   └── services.ts
│   │   ├── nurse/
│   │   │   ├── types.ts
│   │   │   └── services.ts
│   │   ├── pharmacy-dispatch/
│   │   │   ├── types.ts
│   │   │   └── services.ts
│   │   ├── emergency/
│   │   │   ├── types.ts
│   │   │   └── services.ts
│   │   ├── provider/
│   │   │   ├── types.ts
│   │   │   └── services.ts
│   │   └── admin/
│   │       ├── types.ts
│   │       └── services.ts
│   │
│   ├── services/                     # [NEW] API and cross-cutting services
│   │   ├── api/
│   │   │   ├── client.ts             # HTTP client, auth headers
│   │   │   ├── diagnosis.ts          # AI diagnosis API
│   │   │   └── index.ts
│   │   └── audit.ts                 # Audit logging adapter
│   │
│   ├── lib/                          # [EXISTING] Constants, subscription — keep
│   │   ├── constants.ts
│   │   └── subscription.ts
│   │
│   └── types/                        # [NEW] Shared domain types
│       └── index.ts
│
├── docs/
│   ├── ARCHITECTURE.md               # This file
│   ├── DATABASE_SCHEMA.md            # Schema additions
│   └── API_ENDPOINTS.md              # API contract
│
└── [existing config files]
```

---

## 3. Module Responsibilities (Extend Only)

| Module | Purpose | Integrates With Existing |
|--------|---------|---------------------------|
| **Patient** | Medical history, prescriptions, treatment requests, HMO profile, emergency trigger | Patient portal, dashboard, ai-diagnosis, subscribe, EmergencyButton |
| **Pharmacist** | AI request queue, approve/modify prescriptions, escalate to doctor, trigger dispatch | `/pharmacist` page, existing UI |
| **Nurse** | Job assignment, patient location, treatment status, earnings | `/nurse` page |
| **Pharmacy & Dispatch** | Prescription routing, inventory structure, delivery workflow, order status | `/pharmacy`, `/dispatch` |
| **Emergency** | One-click trigger, admin alerts, location share, contact notification | Existing EmergencyButton, future admin |
| **Provider** | Onboarding (hospitals, pharmacies, nurses, pharmacists), verification status | `/marketplace/register`, provider portal |
| **Admin** | Monitor requests, emergencies, provider activity, analytics, user management | New admin routes only |

---

## 4. Migration Strategy (Incremental)

### Phase 1 — Structure & contracts (no breaking changes)

- Add `src/modules/*` with `types.ts` and `services.ts` (API adapters that no-op or use mocks until backend exists).
- Add `src/services/api/client.ts` and `diagnosis.ts`.
- Add `src/types/index.ts` for shared types.
- Add `docs/DATABASE_SCHEMA.md` and `docs/API_ENDPOINTS.md`.
- **Do not** change existing pages or components; they keep current behavior.

### Phase 2 — Wire API layer

- Point `services/api` to real backend base URL (env).
- Replace mock logic in `ai-diagnosis` with `diagnosis` service where desired.
- Keep static export compatible by calling APIs from client (or add Next API routes / separate backend later).

### Phase 3 — Backend and DB

- Introduce backend (Next API routes or separate Node service) and DB (e.g. PostgreSQL).
- Run migrations for new tables only (additive schema).
- Connect each module’s `services.ts` to real endpoints.

### Phase 4 — Role-based access and audit

- Enforce role-based permissions in API and (if present) auth middleware.
- Add audit logging for sensitive actions; use `services/audit.ts` as adapter.

### Phase 5 — Admin and emergency

- Add admin-only routes and dashboard.
- Connect EmergencyButton to emergency API (alerts, location, contacts).

---

## 5. Safety Rules

- **Do not** delete existing features, routes, or components.
- **Do not** redesign current UI or overwrite existing styles.
- **Do not** replace existing auth UI; extend with role checks and API auth when backend exists.
- **Only extend:** new modules and services plug alongside current code; existing pages adopt them optionally.

---

## 6. Phase 1 Implementation (Done)

- **Added:** `src/modules/` (patient, pharmacist, nurse, pharmacy-dispatch, emergency, provider, admin) with `types.ts` and `services.ts` per module.
- **Added:** `src/services/api/` (client, diagnosis) and `src/services/audit.ts`.
- **Added:** `src/types/index.ts` for shared domain types.
- **Added:** `docs/DATABASE_SCHEMA.md`, `docs/API_ENDPOINTS.md`.
- **Unchanged:** All existing app routes, components, and UI.

Optional integration (when you add backend): wire `EmergencyButton` to `modules/emergency/services.sendEmergencyAlert()`, and `ai-diagnosis` page to `services/api/diagnosis.analyzeSymptoms()`.

## 7. Next Steps

1. Add backend (Next API routes or separate service) and implement `docs/API_ENDPOINTS.md`.
2. Run database migrations from `docs/DATABASE_SCHEMA.md`.
3. Set `NEXT_PUBLIC_API_URL` and optionally replace mock flows in UI with module services.
