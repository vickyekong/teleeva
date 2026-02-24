-- Run this in Supabase Dashboard → SQL Editor to apply pending migrations.
-- Requires: profiles, patients, diagnosis_requests already exist.
-- If you get "relation public.diagnosis_requests does not exist", run apply-all-migrations.sql instead (creates all tables from scratch).
--
-- Order: workflow status → prescriptions → treatment_requests

-- 1) Case workflow status (diagnosis_requests)
ALTER TABLE public.diagnosis_requests
  DROP CONSTRAINT IF EXISTS diagnosis_requests_status_check;

ALTER TABLE public.diagnosis_requests
  ADD CONSTRAINT diagnosis_requests_status_check
  CHECK (status IN (
    'pending',
    'pharmacist_review',
    'approved',
    'modified',
    'escalated',
    'AI_ANALYSIS',
    'PENDING_DOCTOR_REVIEW',
    'DOCTOR_APPROVED',
    'COMPLETED',
    'PENDING_PHARMACY',
    'PHARMACY_CONFIRMED',
    'READY_FOR_DISPATCH',
    'DISPATCH_ASSIGNED',
    'IN_TRANSIT',
    'DELIVERED'
  ));

ALTER TABLE public.diagnosis_requests
  ALTER COLUMN status SET DEFAULT 'AI_ANALYSIS';

ALTER TABLE public.diagnosis_requests
  ADD COLUMN IF NOT EXISTS dispatcher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_dispatcher_id ON public.diagnosis_requests(dispatcher_id);

COMMENT ON COLUMN public.diagnosis_requests.status IS 'Case workflow: includes pharmacy and dispatch (DISPATCH_ASSIGNED, IN_TRANSIT, DELIVERED).';
COMMENT ON COLUMN public.diagnosis_requests.dispatcher_id IS 'Dispatcher who accepted delivery assignment.';

-- 1b) Dispatcher role and RLS
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('patient', 'nurse', 'pharmacist', 'doctor', 'hospital', 'lab', 'admin', 'dispatcher'));

DROP POLICY IF EXISTS "Profiles read diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles read diagnosis for providers"
  ON public.diagnosis_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher')));

DROP POLICY IF EXISTS "Profiles update diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles update diagnosis for providers"
  ON public.diagnosis_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher')));

-- 2) Prescriptions
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

DROP POLICY IF EXISTS "Doctors insert prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors insert prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors read own prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors read own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = doctor_id);

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

DROP POLICY IF EXISTS "Patients read own prescriptions" ON public.prescriptions;
CREATE POLICY "Patients read own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

COMMENT ON TABLE public.prescriptions IS 'Prescriptions created by doctors; pharmacists approve and dispatch.';
COMMENT ON COLUMN public.prescriptions.medications IS 'Array of { name, dosage, notes }.';

-- 3) Treatment requests (nurse visits)
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
    'pending', 'assigned', 'en_route', 'in_progress', 'completed',
    'NURSE_ASSIGNED', 'NURSE_EN_ROUTE', 'NURSE_IN_PROGRESS', 'NURSE_COMPLETED'
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

DROP POLICY IF EXISTS "Doctors insert treatment requests" ON public.treatment_requests;
CREATE POLICY "Doctors insert treatment requests"
  ON public.treatment_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by_doctor_id OR requested_by_doctor_id IS NULL);

DROP POLICY IF EXISTS "Doctors read own requested" ON public.treatment_requests;
CREATE POLICY "Doctors read own requested"
  ON public.treatment_requests FOR SELECT
  USING (requested_by_doctor_id = auth.uid());

DROP POLICY IF EXISTS "Nurses read treatment requests" ON public.treatment_requests;
CREATE POLICY "Nurses read treatment requests"
  ON public.treatment_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'nurse')
  );

DROP POLICY IF EXISTS "Nurses update treatment requests" ON public.treatment_requests;
CREATE POLICY "Nurses update treatment requests"
  ON public.treatment_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'nurse')
  );

DROP POLICY IF EXISTS "Patients read own treatment requests" ON public.treatment_requests;
CREATE POLICY "Patients read own treatment requests"
  ON public.treatment_requests FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Patients insert own treatment requests" ON public.treatment_requests;
CREATE POLICY "Patients insert own treatment requests"
  ON public.treatment_requests FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins read treatment requests" ON public.treatment_requests;
CREATE POLICY "Admins read treatment requests"
  ON public.treatment_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

COMMENT ON TABLE public.treatment_requests IS 'Nurse visit requests; created by patient or doctor.';
COMMENT ON COLUMN public.treatment_requests.reason IS 'Brief reason for visit (e.g. wound dressing, medication administration).';

-- 4) Nurse Assignment & Home Care: treatment + case statuses and nurse RLS on diagnosis_requests
ALTER TABLE public.treatment_requests DROP CONSTRAINT IF EXISTS treatment_requests_status_check;
ALTER TABLE public.treatment_requests ADD CONSTRAINT treatment_requests_status_check
  CHECK (status IN (
    'pending', 'assigned', 'en_route', 'in_progress', 'completed',
    'NURSE_ASSIGNED', 'NURSE_EN_ROUTE', 'NURSE_IN_PROGRESS', 'NURSE_COMPLETED'
  ));

ALTER TABLE public.diagnosis_requests DROP CONSTRAINT IF EXISTS diagnosis_requests_status_check;
ALTER TABLE public.diagnosis_requests ADD CONSTRAINT diagnosis_requests_status_check
  CHECK (status IN (
    'pending', 'pharmacist_review', 'approved', 'modified', 'escalated',
    'AI_ANALYSIS', 'PENDING_DOCTOR_REVIEW', 'DOCTOR_APPROVED', 'COMPLETED',
    'PENDING_PHARMACY', 'PHARMACY_CONFIRMED', 'READY_FOR_DISPATCH',
    'DISPATCH_ASSIGNED', 'IN_TRANSIT', 'DELIVERED',
    'NURSE_REQUESTED', 'NURSE_ASSIGNED', 'NURSE_EN_ROUTE', 'NURSE_IN_PROGRESS', 'NURSE_COMPLETED'
  ));

DROP POLICY IF EXISTS "Profiles read diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles read diagnosis for providers"
  ON public.diagnosis_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher', 'nurse')));

DROP POLICY IF EXISTS "Profiles update diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles update diagnosis for providers"
  ON public.diagnosis_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher', 'nurse')));

-- 5) Emergency Response System (extends emergency_alerts if table exists)
-- Run after emergency_alerts exists (e.g. from apply-all or 20250222000004_emergency_alerts.sql)
ALTER TABLE public.emergency_alerts ADD COLUMN IF NOT EXISTS diagnosis_request_id UUID REFERENCES public.diagnosis_requests(id) ON DELETE SET NULL;
ALTER TABLE public.emergency_alerts ADD COLUMN IF NOT EXISTS medical_history_snapshot JSONB;
ALTER TABLE public.emergency_alerts ADD COLUMN IF NOT EXISTS responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.emergency_alerts ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
ALTER TABLE public.emergency_alerts DROP CONSTRAINT IF EXISTS emergency_alerts_status_check;
ALTER TABLE public.emergency_alerts ADD CONSTRAINT emergency_alerts_status_check
  CHECK (status IN ('active', 'acknowledged', 'resolved', 'EMERGENCY_TRIGGERED', 'RESPONDER_ASSIGNED', 'RESOLVED'));
ALTER TABLE public.emergency_alerts ALTER COLUMN status SET DEFAULT 'EMERGENCY_TRIGGERED';
DROP POLICY IF EXISTS "Admins read emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Admins read emergency alerts" ON public.emergency_alerts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "Admins update emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Admins update emergency alerts" ON public.emergency_alerts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 6) Admin Control Center: admin read all profiles and patients; admin update profiles
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
DROP POLICY IF EXISTS "Admins read all patients" ON public.patients;
CREATE POLICY "Admins read all patients" ON public.patients FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 7) Marketing website: newsletter and contact form
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
