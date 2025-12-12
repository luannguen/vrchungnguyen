-- FIX ADMIN DASHBOARD ACCESS
-- Run this script in your Supabase SQL Editor to resolve the 403 error.

-- 1. Ensure public.users table exists and has necessary columns
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Trigger to handle new user signups (Sync auth.users -> public.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user') -- Default to user, or take from metadata
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. SYNC EXISTING USERS (Important if users already exist but missing in public.users)
INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin' -- FORCE ALL EXISTING USERS TO ADMIN (For Dev/Fix)
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';  -- Update existing to admin too for now

-- 4. FIX RLS ON CONTACTS (From your final fix file)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select contacts" ON public.contacts;
CREATE POLICY "Admins can select contacts" 
ON public.contacts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Ensure Insert is Open
DROP POLICY IF EXISTS "Public can insert contacts" ON public.contacts;
CREATE POLICY "Public can insert contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Grant permissions explicitly
GRANT ALL ON TABLE public.contacts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;

-- 5. Helper Function Confirmation
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin') 
  );
$$;
