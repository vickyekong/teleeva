-- Admin Control Center: full system access for admin role.
-- Admins can read all profiles and patients; update profiles (e.g. role changes, approval).

-- 1) Profiles: admin read all, admin update (for provider approval / role management)
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Allow admin to update other users' profiles (role, etc.) - use with care
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- 2) Patients: admin read all (for user management panel)
DROP POLICY IF EXISTS "Admins read all patients" ON public.patients;
CREATE POLICY "Admins read all patients"
  ON public.patients FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

COMMENT ON TABLE public.profiles IS 'User profiles; admin can read/update all for control center.';
