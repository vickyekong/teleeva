-- MedConnect: diagnosis_requests (primary "cases" for AI diagnosis workflow)

CREATE TABLE IF NOT EXISTS public.diagnosis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  session_id TEXT,
  symptoms_text TEXT NOT NULL,
  ai_risk_level VARCHAR(20),
  ai_confidence INTEGER,
  ai_conditions JSONB DEFAULT '[]',
  ai_medications JSONB DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'pharmacist_review', 'approved', 'modified', 'escalated'
  )),
  pharmacist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_status ON public.diagnosis_requests(status);
CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_patient_id ON public.diagnosis_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_created_at ON public.diagnosis_requests(created_at DESC);

ALTER TABLE public.diagnosis_requests ENABLE ROW LEVEL SECURITY;

-- Patients can read their own requests (via patient_id -> patients.user_id)
CREATE POLICY "Patients read own diagnosis requests"
  ON public.diagnosis_requests FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- Patients can insert (create new case) when patient_id matches their record
CREATE POLICY "Patients create own diagnosis requests"
  ON public.diagnosis_requests FOR INSERT
  WITH CHECK (
    patient_id IS NULL OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- Pharmacists and doctors can read/update (add policy by role in app or add role check)
CREATE POLICY "Profiles read diagnosis for providers"
  ON public.diagnosis_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin')
    )
  );

CREATE POLICY "Profiles update diagnosis for providers"
  ON public.diagnosis_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin')
    )
  );

COMMENT ON TABLE public.diagnosis_requests IS 'AI diagnosis cases; symptoms, risk, and pharmacist review status.';
