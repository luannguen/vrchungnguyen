-- Fix RLS for site_settings to ensure frontend can read it

-- 1. Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if any to avoid conflicts (optional but safer)
DROP POLICY IF EXISTS "Public view settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read access" ON public.site_settings;

-- 3. Create Public Read Policy
CREATE POLICY "Public view settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- 4. Ensure Admin Write Policy exists
DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;

CREATE POLICY "Admins manage settings" 
ON public.site_settings 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE role IN ('admin', 'super_admin')
  )
);

-- 5. Grant permissions just in case
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
