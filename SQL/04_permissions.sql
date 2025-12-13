-- 1. Ensure Roles Exist
INSERT INTO public.roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('editor', 'Editor', 'Can manage content but not users or system settings'),
('user', 'User', 'Standard user access')
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name,
description = EXCLUDED.description;

-- 2. Define Permissions
-- Format: resource.action
INSERT INTO public.permissions (code, description) VALUES
-- User Management
('users.view', 'View users list'),
('users.create', 'Create new users'),
('users.edit', 'Edit existing users'),
('users.delete', 'Delete users'),
('roles.manage', 'Manage roles and permissions'),

-- Content Management (Products, News, Events, etc.)
('content.view', 'View content'),
('content.create', 'Create content'),
('content.edit', 'Edit content'),
('content.delete', 'Delete content'),

-- System Settings
('settings.view', 'View system settings'),
('settings.manage', 'Manage system settings')
ON CONFLICT (code) DO NOTHING;

-- 3. Assign Permissions to Roles

-- ADMIN: All Permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- EDITOR: Content Management + View Users (but not create/delete users or settings)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'editor', id FROM public.permissions 
WHERE code IN (
    'content.view', 'content.create', 'content.edit', 'content.delete',
    'users.view', 'dashboard.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- USER: Minimal access (if any specific permissions needed)
-- Currently logic defaults to 'no admin access', but if we added public features protected by permission:
-- INSERT INTO public.role_permissions (role_id, permission_id) ...
