-- MedConnect: patients (links auth user to patient record)

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date_of_birth DATE,
  blood_type VARCHAR(10),
  allergies TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Patients can read/update their own record (by user_id)
CREATE POLICY "Patients read own"
  ON public.patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Patients update own"
  ON public.patients FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role / admin can insert (e.g. on first subscription)
CREATE POLICY "Allow insert for authenticated"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.patients IS 'Patient records; user_id links to auth.users for logged-in patients.';
