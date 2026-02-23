-- Pharmacy workflow: add case statuses PENDING_PHARMACY, PHARMACY_CONFIRMED, READY_FOR_DISPATCH

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
    'READY_FOR_DISPATCH'
  ));

COMMENT ON COLUMN public.diagnosis_requests.status IS 'Case workflow includes: PENDING_PHARMACY, PHARMACY_CONFIRMED, READY_FOR_DISPATCH for pharmacy management.';
