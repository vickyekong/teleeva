-- Admin RLS only: run this in Supabase Dashboard → SQL Editor.
-- Requires: profiles, patients, emergency_alerts tables exist.

-- Emergency: admin read + update emergency_alerts
DROP POLICY IF EXISTS "Admins read emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Admins read emergency alerts" ON public.emergency_alerts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admins update emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Admins update emergency alerts" ON public.emergency_alerts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Admin Control Center: profiles + patients
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admins read all patients" ON public.patients;
CREATE POLICY "Admins read all patients" ON public.patients FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
