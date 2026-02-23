# Patient Application — Verification Checklist

This document confirms the Patient Application system and Supabase integration.

---

## 1. User authentication

- **Login page** (`/login`): Sign in and sign up with Supabase Auth. Email + password; role selection (patient, nurse, pharmacist, doctor, hospital). Sign up stores `role` and `full_name` in auth metadata; trigger creates **profiles** row on signup.
- **Auth context** (`src/contexts/AuthContext.tsx`): Provides `user`, `profile`, `patientId`, `signIn`, `signUp`, `signOut`, `refreshPatientId`. On login, fetches profile; for role `patient`, ensures a **patients** row exists and sets `patientId`.
- **Navbar**: Shows "Sign Out" when logged in, "Sign In" when not. Sign out clears session and redirects to `/app`.
- **Root layout**: Wraps app with `Providers` → `AuthProvider` so all pages can use `useAuth()`.

---

## 2. Symptom input and AI diagnosis

- **AI diagnosis page** (`/ai-diagnosis`): Form accepts free-text symptoms (and "Hi Eva" greeting). On submit:
  - Calls **analyzeSymptoms** from `@/services/api/diagnosis` (POST `/api/diagnosis/analyze` → OpenAI).
  - Displays **AI diagnosis**: risk level, confidence, conditions, medications, disclaimer.
  - If user is logged in and has `patientId`, **saves the case** to Supabase **diagnosis_requests** (symptoms_text, ai_risk_level, ai_confidence, ai_conditions, ai_medications, status `pending`).
- **Loading state**: Shows "Eva is analyzing…" while the request is in progress.

---

## 3. Medical history storage

- **Table**: **medical_history** (migration `20250222000005_medical_history.sql`): `patient_id`, `record_type`, `summary`, `recorded_at`, `created_at`. RLS: patients can SELECT/INSERT own rows.
- **Dashboard** (`/patient/dashboard`): "Medical History" tab:
  - Fetches **medical_history** from Supabase for current `patientId`.
  - Form to **add** entry: record_type (diagnosis / procedure / allergy / chronic), summary. Insert via Supabase client; new row appended to list.

---

## 4. Case tracking interface

- **Page** (`/patient/cases`): Lists all **diagnosis_requests** for the current patient from Supabase (ordered by `created_at` desc).
  - If not signed in or no patient: message and link to Sign in.
  - If no cases: message and link to "Talk to Eva".
  - Each case shows: date, risk level, status, symptoms snippet, confidence, conditions.
- **Links**: "View my cases →" on AI diagnosis page; "My Cases (Eva)" in dashboard Quick Actions.

---

## 5. Emergency alert button

- **Component** (`EmergencyButton`): Uses **useAuth** for `patientId` and **getSupabaseBrowserClient**.
  - When Supabase is available: gets location (if permitted), calls **sendEmergencyAlert** with `lat`, `lng`, `patientId`. **sendEmergencyAlert** inserts into Supabase **emergency_alerts** (patient_id, latitude, longitude, address_snapshot, status `active`). Falls back to legacy API if Supabase insert fails and `NEXT_PUBLIC_API_URL` is set.
  - When Supabase is not available: shows same UI and message; no backend call.

---

## 6. Supabase data flow

| Feature            | Table(s)            | Flow                                                                 |
|--------------------|---------------------|----------------------------------------------------------------------|
| Auth               | auth.users          | Sign in/up via Supabase Auth.                                        |
| Profile / role     | profiles            | Created by trigger on signup; updated on login if role changed.       |
| Patient record    | patients            | Created on first load when profile.role = patient (ensurePatientAndGetId). |
| AI cases          | diagnosis_requests  | Insert after OpenAI response when patientId exists.                  |
| Case list         | diagnosis_requests  | Select by patient_id on /patient/cases.                              |
| Medical history   | medical_history     | Select/insert by patient_id on dashboard Medical History tab.        |
| Emergency         | emergency_alerts    | Insert with patient_id, lat, lng from EmergencyButton.               |

---

## 7. Run migrations

Ensure these migrations are applied in the Supabase project (in order):

1. `20250222000001_profiles.sql`
2. `20250222000002_patients.sql`
3. `20250222000003_diagnosis_requests_cases.sql`
4. `20250222000004_emergency_alerts.sql`
5. `20250222000005_medical_history.sql`

---

## 8. Build

- `npm run build` completes successfully.
- All existing UI, layouts, and styling are preserved; new behavior is additive (auth, Supabase-backed diagnosis, cases, medical history, emergency).
