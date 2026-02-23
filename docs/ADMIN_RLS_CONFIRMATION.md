# Admin Control Center – Supabase RLS Confirmation

This document confirms that Row Level Security (RLS) allows the admin role to perform every operation used by the Admin Control Center.

---

## How admin is identified

- Admin = user whose `public.profiles` row has `role = 'admin'`.
- All admin policies use:
  `EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')`
- The admin can read their own profile via "Users can read own profile" (own-row SELECT), so this check succeeds for admins.

---

## Tables used by the Admin Dashboard

| Table | Admin dashboard use | Required access | Policy name | Status |
|-------|---------------------|-----------------|-------------|--------|
| **profiles** | Providers tab: list doctors/nurses/pharmacists/dispatchers; Approve/Revoke (update `metadata.approved`) | SELECT all, UPDATE any | "Admins read all profiles", "Admins update profiles" | ✅ In apply-migrations.sql §6 and 20250228000001 |
| **patients** | Cases/Users tabs: resolve patient names; list patient accounts | SELECT all | "Admins read all patients" | ✅ In apply-migrations.sql §6 and 20250228000001 |
| **diagnosis_requests** | Cases tab: list all cases; Analytics: counts and timings | SELECT all | "Profiles read diagnosis for providers" (includes `admin`) | ✅ apply-migrations §1b & §4 |
| **emergency_alerts** | Emergency tab: list alerts, assign/resolve | SELECT all, UPDATE any | "Admins read emergency alerts", "Admins update emergency alerts" | ✅ apply-migrations §5 |
| **prescriptions** | Analytics: total count | SELECT all | "Profiles read prescriptions for pharmacists" (includes `admin`) | ✅ apply-migrations §2 |
| **treatment_requests** | Analytics: total count | SELECT all | "Admins read treatment requests" | ✅ apply-migrations §3 |

---

## Policy definitions (admin-only)

All of the following are present in **apply-migrations.sql** (and in **apply-all-migrations.sql** for full setup).

### profiles
- **Admins read all profiles** – `FOR SELECT` – `USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))`
- **Admins update profiles** – `FOR UPDATE` – same `USING` (allows provider approval and role changes)

### patients
- **Admins read all patients** – `FOR SELECT` – same `USING` as above

### emergency_alerts
- **Admins read emergency alerts** – `FOR SELECT` – same `USING`
- **Admins update emergency alerts** – `FOR UPDATE` – same `USING`

### treatment_requests
- **Admins read treatment requests** – `FOR SELECT` – same `USING`

### diagnosis_requests (admin included in provider policies)
- **Profiles read diagnosis for providers** – `FOR SELECT` – `role IN ('pharmacist', 'doctor', 'admin', 'dispatcher', 'nurse')`
- **Profiles update diagnosis for providers** – `FOR UPDATE` – same role list

### prescriptions (admin included in pharmacist policies)
- **Profiles read prescriptions for pharmacists** – `FOR SELECT` – `role IN ('pharmacist', 'admin')`
- **Profiles update prescriptions for pharmacists** – `FOR UPDATE` – same (admin can update if needed)

---

## Migration files

| File | Purpose |
|------|---------|
| **supabase/migrations/20250228000001_admin_control_center_rls.sql** | Defines admin policies for `profiles` and `patients` only. |
| **supabase/apply-migrations.sql** | Incremental apply: includes all sections above (§1b–§6). Use when tables already exist. |
| **supabase/apply-all-migrations.sql** | Full schema + all RLS from scratch. |

Emergency admin policies are in **20250227000001_emergency_response_system.sql** and are also applied via apply-migrations.sql §5.

---

## Checklist

- [x] Admin can SELECT all rows from `profiles` (dashboard + provider list).
- [x] Admin can UPDATE any row in `profiles` (Approve/Revoke button).
- [x] Admin can SELECT all rows from `patients` (Cases/Users tabs).
- [x] Admin can SELECT all rows from `diagnosis_requests` (Cases + Analytics).
- [x] Admin can SELECT and UPDATE `emergency_alerts` (Emergency tab).
- [x] Admin can SELECT from `prescriptions` and `treatment_requests` (Analytics).
- [x] All policies use `profiles.role = 'admin'`; no service role or bypass.

**Conclusion:** RLS is correctly configured for the Admin Control Center. Apply **apply-migrations.sql** (or run the migrations in order) in the Supabase SQL Editor to ensure your project has these policies.
