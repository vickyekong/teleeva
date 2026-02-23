-- Case workflow: add status values AI_ANALYSIS, PENDING_DOCTOR_REVIEW, DOCTOR_APPROVED, COMPLETED
-- Keeps existing: pending, pharmacist_review, approved, modified, escalated

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
    'COMPLETED'
  ));

-- New cases from AI start in AI_ANALYSIS (optional: change default; existing rows unchanged)
ALTER TABLE public.diagnosis_requests
  ALTER COLUMN status SET DEFAULT 'AI_ANALYSIS';

COMMENT ON COLUMN public.diagnosis_requests.status IS 'Case workflow: AI_ANALYSIS, PENDING_DOCTOR_REVIEW, DOCTOR_APPROVED, COMPLETED; legacy: pending, pharmacist_review, approved, modified, escalated';
