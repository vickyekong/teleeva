-- Dispatch & delivery: dispatcher role, dispatcher_id on cases, delivery statuses.

-- 1) Add 'dispatcher' to profiles role
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'patient', 'nurse', 'pharmacist', 'doctor', 'hospital', 'lab', 'admin', 'dispatcher'
  ));

-- 2) Add dispatcher_id and delivery statuses to diagnosis_requests
ALTER TABLE public.diagnosis_requests
  ADD COLUMN IF NOT EXISTS dispatcher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.diagnosis_requests
  DROP CONSTRAINT IF EXISTS diagnosis_requests_status_check;

ALTER TABLE public.diagnosis_requests
  ADD CONSTRAINT diagnosis_requests_status_check
  CHECK (status IN (
    'pending', 'pharmacist_review', 'approved', 'modified', 'escalated',
    'AI_ANALYSIS', 'PENDING_DOCTOR_REVIEW', 'DOCTOR_APPROVED', 'COMPLETED',
    'PENDING_PHARMACY', 'PHARMACY_CONFIRMED', 'READY_FOR_DISPATCH',
    'DISPATCH_ASSIGNED', 'IN_TRANSIT', 'DELIVERED'
  ));

CREATE INDEX IF NOT EXISTS idx_diagnosis_requests_dispatcher_id ON public.diagnosis_requests(dispatcher_id);

-- 3) RLS: dispatchers can read and update diagnosis_requests (delivery workflow)
DROP POLICY IF EXISTS "Profiles read diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles read diagnosis for providers"
  ON public.diagnosis_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher')
    )
  );

DROP POLICY IF EXISTS "Profiles update diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles update diagnosis for providers"
  ON public.diagnosis_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher')
    )
  );

COMMENT ON COLUMN public.diagnosis_requests.dispatcher_id IS 'Dispatcher who accepted the delivery assignment (set when status = DISPATCH_ASSIGNED).';
