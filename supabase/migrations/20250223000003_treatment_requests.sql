-- Treatment requests (nurse visits): patient + optional link to diagnosis; doctor or patient can request.

CREATE TABLE IF NOT EXISTS public.treatment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  reason TEXT,
  address_or_lat_lng VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  diagnosis_request_id UUID REFERENCES public.diagnosis_requests(id) ON DELETE SET NULL,
  requested_by_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'assigned', 'en_route', 'in_progress', 'completed'
  )),
  assigned_nurse_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_requests_patient_id ON public.treatment_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_requests_status ON public.treatment_requests(status);
CREATE INDEX IF NOT EXISTS idx_treatment_requests_requested_by_doctor ON public.treatment_requests(requested_by_doctor_id);

ALTER TABLE public.treatment_requests ENABLE ROW LEVEL SECURITY;

-- Doctors can insert (request on behalf of patient) and read their requested visits
CREATE POLICY "Doctors insert treatment requests"
  ON public.treatment_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by_doctor_id OR requested_by_doctor_id IS NULL);

CREATE POLICY "Doctors read own requested"
  ON public.treatment_requests FOR SELECT
  USING (requested_by_doctor_id = auth.uid());

-- Nurses can read all pending/assigned and update when assigned to them
CREATE POLICY "Nurses read treatment requests"
  ON public.treatment_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'nurse')
  );

CREATE POLICY "Nurses update treatment requests"
  ON public.treatment_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'nurse')
  );

-- Patients can read their own and insert (self-request)
CREATE POLICY "Patients read own treatment requests"
  ON public.treatment_requests FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients insert own treatment requests"
  ON public.treatment_requests FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- Admins can read all
CREATE POLICY "Admins read treatment requests"
  ON public.treatment_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

COMMENT ON TABLE public.treatment_requests IS 'Nurse visit requests; created by patient or doctor.';
COMMENT ON COLUMN public.treatment_requests.reason IS 'Brief reason for visit (e.g. wound dressing, medication administration).';
