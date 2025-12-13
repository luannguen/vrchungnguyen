-- Migration: Fix Users Role Constraint
-- Description: Removes restrictive CHECK constraint on users.role and adds Foreign Key to public.roles.

-- 1. Ensure 'super_admin' exists in roles table (allowed in old constraint but missing in seed)
INSERT INTO public.roles (id, name, description)
VALUES ('super_admin', 'Super Administrator', 'Has full system access and can manage all aspects of the platform.')
ON CONFLICT (id) DO NOTHING;

-- 2. Drop the restrictive CHECK constraint on the role column
-- The constraint name might vary if it was auto-generated, but usually it follows this pattern if named implicitly.
-- If checking 'users_role_check' fails, we might need a more dynamic approach or manual check, 
-- but 'users_role_check' is the standard naming convention for: CHECK (role IN (...)) on table users.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 3. Add a Foreign Key constraint to public.roles(id)
-- This ensures that any role assigned to a user must exist in the roles table.
ALTER TABLE public.users
ADD CONSTRAINT users_role_fkey
FOREIGN KEY (role)
REFERENCES public.roles(id)
ON UPDATE CASCADE
ON DELETE SET DEFAULT;
