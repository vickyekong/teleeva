-- Prescriptions: linked to diagnosis case and patient; doctor creates, pharmacist approves.

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_request_id UUID REFERENCES public.diagnosis_requests(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pharmacist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  medications JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'dispatched', 'delivered')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Doctors can insert (with their id as doctor_id) and read their own
DROP POLICY IF EXISTS "Doctors insert prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors insert prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors read own prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors read own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = doctor_id);

-- Pharmacists and admins can read/update (for approval queue)
DROP POLICY IF EXISTS "Profiles read prescriptions for pharmacists" ON public.prescriptions;
CREATE POLICY "Profiles read prescriptions for pharmacists"
  ON public.prescriptions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'admin'))
  );

DROP POLICY IF EXISTS "Profiles update prescriptions for pharmacists" ON public.prescriptions;
CREATE POLICY "Profiles update prescriptions for pharmacists"
  ON public.prescriptions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'admin'))
  );

-- Patients can read their own (via patient_id -> patients.user_id)
DROP POLICY IF EXISTS "Patients read own prescriptions" ON public.prescriptions;
CREATE POLICY "Patients read own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

COMMENT ON TABLE public.prescriptions IS 'Prescriptions created by doctors; pharmacists approve and dispatch.';
COMMENT ON COLUMN public.prescriptions.medications IS 'Array of { name, dosage, notes }.';
