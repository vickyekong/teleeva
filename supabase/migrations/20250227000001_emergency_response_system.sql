-- Emergency Response System: case link, medical snapshot, status workflow, admin access.
-- Extends existing emergency_alerts table.

-- 1) Add columns if not present (idempotent)
ALTER TABLE public.emergency_alerts
  ADD COLUMN IF NOT EXISTS diagnosis_request_id UUID REFERENCES public.diagnosis_requests(id) ON DELETE SET NULL;
ALTER TABLE public.emergency_alerts
  ADD COLUMN IF NOT EXISTS medical_history_snapshot JSONB;
ALTER TABLE public.emergency_alerts
  ADD COLUMN IF NOT EXISTS responder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.emergency_alerts
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- 2) Extend status to include EMERGENCY_TRIGGERED, RESPONDER_ASSIGNED, RESOLVED
ALTER TABLE public.emergency_alerts
  DROP CONSTRAINT IF EXISTS emergency_alerts_status_check;

ALTER TABLE public.emergency_alerts
  ADD CONSTRAINT emergency_alerts_status_check
  CHECK (status IN (
    'active', 'acknowledged', 'resolved',
    'EMERGENCY_TRIGGERED', 'RESPONDER_ASSIGNED', 'RESOLVED'
  ));

ALTER TABLE public.emergency_alerts
  ALTER COLUMN status SET DEFAULT 'EMERGENCY_TRIGGERED';

COMMENT ON COLUMN public.emergency_alerts.diagnosis_request_id IS 'Linked patient case (diagnosis request) when alert was triggered from a case context.';
COMMENT ON COLUMN public.emergency_alerts.medical_history_snapshot IS 'Snapshot of patient medical context at trigger time (symptoms, risk, conditions, medications).';
COMMENT ON COLUMN public.emergency_alerts.responder_id IS 'Admin or responder assigned to this emergency.';
COMMENT ON COLUMN public.emergency_alerts.responded_at IS 'When a responder was assigned.';

-- 3) Admin: read and update all emergency alerts (for dashboard and assign/resolve)
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
