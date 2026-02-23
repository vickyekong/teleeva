-- MedConnect: run ALL migrations in order (use this if diagnosis_requests or other base tables don't exist yet).
-- Run in Supabase Dashboard → SQL Editor. Safe to run on empty DB; uses IF NOT EXISTS / DROP IF EXISTS where appropriate.

-- ========== 1. PROFILES ==========
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN (
    'patient', 'nurse', 'pharmacist', 'doctor', 'hospital', 'lab', 'admin', 'dispatcher'
  )),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth; role and display info for MedConnect.';

-- ========== 2. PATIENTS ==========
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

DROP POLICY IF EXISTS "Patients read own" ON public.patients;
CREATE POLICY "Patients read own"
  ON public.patients FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients update own" ON public.patients;
CREATE POLICY "Patients update own"
  ON public.patients FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.patients;
CREATE POLICY "Allow insert for authenticated"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all patients" ON public.patients;
CREATE POLICY "Admins read all patients"
  ON public.patients FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

COMMENT ON TABLE public.patients IS 'Patient records; user_id links to auth.users for logged-in patients.';

-- ========== 3. DIAGNOSIS_REQUESTS ==========
CREATE TABLE IF NOT EXISTS public.diagnosis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  session_id TEXT,
  symptoms_text TEXT NOT NULL,
  ai_risk_level VARCHAR(20),
  ai_confidence INTEGER,
  ai_conditions JSONB DEFAULT '[]',
  ai_medications JSONB DEFAULT '[]',
  status VARCHAR(50) NOT NULL DEFAULT 'AI_ANALYSIS' CHECK (status IN (
    'pending', 'pharmacist_review', 'approved', 'modified', 'escalated',
    'AI_ANALYSIS', 'PENDING_DOCTOR_REVIEW', 'DOCTOR_APPROVED', 'COMPLETED',
    'PENDING_PHARMACY', 'PHARMACY_CONFIRMED', 'READY_FOR_DISPATCH',
    'DISPATCH_ASSIGNED', 'IN_TRANSIT', 'DELIVERED',
    'NURSE_REQUESTED', 'NURSE_ASSIGNED', 'NURSE_EN_ROUTE', 'NURSE_IN_PROGRESS', 'NURSE_COMPLETED'
  )),
  pharmacist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dispatcher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_status ON public.diagnosis_requests(status);
CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_patient_id ON public.diagnosis_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_dispatcher_id ON public.diagnosis_requests(dispatcher_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_created_at ON public.diagnosis_requests(created_at DESC);

ALTER TABLE public.diagnosis_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients read own diagnosis requests" ON public.diagnosis_requests;
CREATE POLICY "Patients read own diagnosis requests"
  ON public.diagnosis_requests FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Patients create own diagnosis requests" ON public.diagnosis_requests;
CREATE POLICY "Patients create own diagnosis requests"
  ON public.diagnosis_requests FOR INSERT
  WITH CHECK (
    patient_id IS NULL OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Profiles read diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles read diagnosis for providers"
  ON public.diagnosis_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher', 'nurse')
    )
  );

DROP POLICY IF EXISTS "Profiles update diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles update diagnosis for providers"
  ON public.diagnosis_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher', 'nurse')
    )
  );

COMMENT ON TABLE public.diagnosis_requests IS 'AI diagnosis cases; symptoms, risk, pharmacist and dispatch workflow.';
COMMENT ON COLUMN public.diagnosis_requests.dispatcher_id IS 'Dispatcher who accepted delivery (set when status = DISPATCH_ASSIGNED).';

-- ========== 4. EMERGENCY_ALERTS ==========
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  diagnosis_request_id UUID REFERENCES public.diagnosis_requests(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address_snapshot VARCHAR(500),
  medical_history_snapshot JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'EMERGENCY_TRIGGERED' CHECK (status IN (
    'active', 'acknowledged', 'resolved',
    'EMERGENCY_TRIGGERED', 'RESPONDER_ASSIGNED', 'RESOLVED'
  )),
  responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_acknowledged_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON public.emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON public.emergency_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_patient_id ON public.emergency_alerts(patient_id);

ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients read own emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Patients read own emergency alerts"
  ON public.emergency_alerts FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Patients create own emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Patients create own emergency alerts"
  ON public.emergency_alerts FOR INSERT
  WITH CHECK (
    patient_id IS NULL OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins read emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Admins read emergency alerts"
  ON public.emergency_alerts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "Admins update emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Admins update emergency alerts"
  ON public.emergency_alerts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

COMMENT ON TABLE public.emergency_alerts IS 'One-tap emergency alerts; linked to patient case, location and medical snapshot; status: EMERGENCY_TRIGGERED → RESPONDER_ASSIGNED → RESOLVED.';

-- ========== 5. MEDICAL_HISTORY ==========
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

DROP POLICY IF EXISTS "Patients read own medical history" ON public.medical_history;
CREATE POLICY "Patients read own medical history"
  ON public.medical_history FOR SELECT
  USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Patients insert own medical history" ON public.medical_history;
CREATE POLICY "Patients insert own medical history"
  ON public.medical_history FOR INSERT
  WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

COMMENT ON TABLE public.medical_history IS 'Patient medical history entries; record_type e.g. diagnosis, procedure, allergy, chronic.';

-- ========== 6. PRESCRIPTIONS ==========
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

-- ========== 7. TREATMENT_REQUESTS ==========
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
