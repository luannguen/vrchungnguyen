-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY, -- 'admin', 'editor', 'user'
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- 'read:users', 'write:content'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create role_permissions join table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies (Allow read for authenticated, write for admins only)
CREATE POLICY "Allow read access for authenticated users" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for authenticated users" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');

-- Admin write access (reuse is_admin function from fix_rls.sql)
CREATE POLICY "Allow full access for admins" ON public.roles USING (public.is_admin());
CREATE POLICY "Allow full access for admins" ON public.permissions USING (public.is_admin());
CREATE POLICY "Allow full access for admins" ON public.role_permissions USING (public.is_admin());


-- SEED DATA
-- Insert Roles
INSERT INTO public.roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('editor', 'Editor', 'Can manage content'),
('user', 'User', 'Standard user access')
ON CONFLICT (id) DO NOTHING;

-- Insert Permissions
INSERT INTO public.permissions (code, description) VALUES
('read:users', 'Can view user list'),
('write:users', 'Can manage users'),
('read:content', 'Can view content'),
('write:content', 'Can create/edit content'),
('delete:content', 'Can delete content'),
('manage:settings', 'Can manage system settings')
ON CONFLICT (code) DO NOTHING;

-- Map Permissions to Roles
-- Admin: All permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Editor: Content management + read users
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'editor', id FROM public.permissions WHERE code IN ('read:users', 'read:content', 'write:content')
ON CONFLICT DO NOTHING;

-- User: Read content only
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'user', id FROM public.permissions WHERE code IN ('read:content')
ON CONFLICT DO NOTHING;
