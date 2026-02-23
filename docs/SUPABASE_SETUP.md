# MedConnect — Supabase Integration

This project is set up for **Supabase** (database and authentication). All existing UI, layouts, and styling are unchanged; this document describes how to connect and use Supabase.

---

## 1. Environment variables

1. Copy the example env file:
   ```bash
   cp env.local.example .env.local
   ```
2. In [Supabase Dashboard](https://app.supabase.com) → your project → **Settings** → **API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Put these into `.env.local`. Do not commit `.env.local`.

---

## 2. Database migrations

Run migrations in the Supabase project so the base tables exist.

**Option A — Supabase Dashboard (SQL Editor)**  
Run the SQL in each file under `supabase/migrations/` in order:

1. `20250222000001_profiles.sql`
2. `20250222000002_patients.sql`
3. `20250222000003_diagnosis_requests_cases.sql`
4. `20250222000004_emergency_alerts.sql`
5. `20250222000005_medical_history.sql`
6. `20250223000001_diagnosis_request_workflow_status.sql`
7. `20250223000002_prescriptions.sql`
8. `20250223000003_treatment_requests.sql`

**Quick apply (workflow + prescriptions + treatment_requests):**  
Open [Supabase](https://app.supabase.com) → your project → **SQL Editor**, paste and run the contents of `supabase/apply-migrations.sql`.

**Option B — Supabase CLI**  
If you use the [Supabase CLI](https://supabase.com/docs/guides/cli) and are logged in (`npx supabase login`):

```bash
npx supabase link --project-ref your-project-ref
npm run db:push
```

---

## 3. Base tables created

| Table                 | Purpose                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| **profiles**          | Extends `auth.users`: `id` (same as auth user), `role`, `full_name`, etc. Auto-created on signup. |
| **patients**          | Patient record per user: `user_id` → `auth.users`, DOB, blood type, allergies. |
| **diagnosis_requests**| Main “cases” for AI diagnosis: symptoms, risk, status, pharmacist review. |
| **emergency_alerts**  | One-tap emergency: optional patient, lat/lng, status.                  |

RLS (Row Level Security) is enabled so users only access their own data; providers have policies for reading/updating diagnosis requests.

---

## 4. Using the Supabase client

**In Client Components (browser):**

```ts
import { getSupabaseBrowserClient } from "@/lib/supabase";

const supabase = getSupabaseBrowserClient();
if (supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
}
```

**Sign up / sign in (client):**

```ts
await supabase.auth.signUp({ email, password, options: { data: { role: "patient" } } });
await supabase.auth.signInWithPassword({ email, password });
```

**Server (when not using static export):**

```ts
import { createServerSupabaseClient } from "@/lib/supabase";

const supabase = await createServerSupabaseClient();
const { data } = await supabase.from("profiles").select("*");
```

---

## 5. Static export note

The app is currently built with `output: "export"` (static site). Supabase is used from the **client** only in that setup. The server client and middleware are available when you run Next.js with a server (e.g. remove `output: "export"` or use API routes / Server Actions).

---

## 6. Preserved behavior

- All existing pages, components, and styles are unchanged.
- Login page is still UI-only; you can wire it to `supabase.auth.signInWithPassword()` when ready.
- Subscription gate and patient flow are unchanged; you can later tie “subscribed” to a `patients` row or subscription table in Supabase.
