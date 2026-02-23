-- MedConnect: medical_history (patient medical history records)

CREATE TABLE IF NOT EXISTS public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  record_type VARCHAR(50),
  summary TEXT,
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON public.medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_created_at ON public.medical_history(created_at DESC);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients read own medical history"
  ON public.medical_history FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients insert own medical history"
  ON public.medical_history FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

COMMENT ON TABLE public.medical_history IS 'Patient medical history entries; record_type e.g. diagnosis, procedure, allergy, chronic.';
