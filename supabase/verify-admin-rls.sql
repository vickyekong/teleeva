-- Run in Supabase Dashboard → SQL Editor to verify admin RLS policies exist.
-- Expected: see "Admins read all profiles", "Admins update profiles", "Admins read all patients",
--           "Admins read emergency alerts", "Admins update emergency alerts", "Admins read treatment requests".
-- Provider policies that include admin: "Profiles read/update diagnosis for providers",
-- "Profiles read/update prescriptions for pharmacists".

SELECT tablename, policyname, cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'patients', 'diagnosis_requests', 'emergency_alerts', 'prescriptions', 'treatment_requests')
ORDER BY tablename, policyname;
