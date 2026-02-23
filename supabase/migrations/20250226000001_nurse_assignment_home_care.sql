-- Nurse Assignment and Home Care: treatment statuses and case integration.
-- Use existing treatment_requests table; extend status and link case updates.

-- 1) treatment_requests: add nurse workflow statuses (keep existing for backward compat)
ALTER TABLE public.treatment_requests
  DROP CONSTRAINT IF EXISTS treatment_requests_status_check;

ALTER TABLE public.treatment_requests
  ADD CONSTRAINT treatment_requests_status_check
  CHECK (status IN (
    'pending',
    'assigned', 'en_route', 'in_progress', 'completed',
    'NURSE_ASSIGNED', 'NURSE_EN_ROUTE', 'NURSE_IN_PROGRESS', 'NURSE_COMPLETED'
  ));

COMMENT ON COLUMN public.treatment_requests.status IS 'Nurse workflow: pending → NURSE_ASSIGNED (accept) → NURSE_EN_ROUTE → NURSE_IN_PROGRESS → NURSE_COMPLETED. Legacy: assigned, en_route, in_progress, completed.';

-- 2) diagnosis_requests: add nurse-related case statuses for integration
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
    'DELIVERED',
    'NURSE_REQUESTED',
    'NURSE_ASSIGNED',
    'NURSE_EN_ROUTE',
    'NURSE_IN_PROGRESS',
    'NURSE_COMPLETED'
  ));

COMMENT ON COLUMN public.diagnosis_requests.status IS 'Case workflow: includes nurse (NURSE_REQUESTED … NURSE_COMPLETED) and dispatch.';

-- 3) RLS: nurses can update diagnosis_requests (for linked case status when nurse updates treatment)
DROP POLICY IF EXISTS "Profiles update diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles update diagnosis for providers"
  ON public.diagnosis_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher', 'nurse')));

-- 4) Nurses can read diagnosis_requests (to show case context on treatment)
DROP POLICY IF EXISTS "Profiles read diagnosis for providers" ON public.diagnosis_requests;
CREATE POLICY "Profiles read diagnosis for providers"
  ON public.diagnosis_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor', 'admin', 'dispatcher', 'nurse')));
