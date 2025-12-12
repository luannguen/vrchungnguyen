-- Fix Admin Permissions Script
-- Run this in Supabase SQL Editor

-- 1. Ensure Roles Exist
INSERT INTO public.roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('editor', 'Editor', 'Can manage content'),
('user', 'User', 'Standard user access')
ON CONFLICT (id) DO NOTHING;

-- 2. Sync Metadata from Auth to Public Users (Fix missing records)
INSERT INTO public.users (id, email, full_name, avatar_url, role)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'avatar_url', 
    COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;

-- 3. Grant Admin Role to SPECIFIC User
-- REPLACE 'your_email@example.com' with your actual login email
UPDATE public.users 
SET role = 'admin'
WHERE email = 'your_email@example.com'; 

-- OPTIONAL: Grant Admin to ALL users (Use with caution in production)
-- UPDATE public.users SET role = 'admin';

-- 4. Verify Result
SELECT * FROM public.users;
