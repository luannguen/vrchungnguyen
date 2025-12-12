-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Function to check if the current user is an admin
-- SECURITY DEFINER allows this function to run with the privileges of the creator (usually postgres/admin)
-- avoiding infinite recursion when querying the users table within an RLS policy.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Policy to allow admins to update any user
-- DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy to allow admins to select all users (if not already covered)
-- DROP POLICY IF EXISTS "Admins can select all users" ON public.users;
CREATE POLICY "Admins can select all users"
ON public.users
FOR SELECT
USING (public.is_admin());
