-- Add dashboard.view permission
INSERT INTO public.permissions (code, description)
VALUES ('dashboard.view', 'Access the admin dashboard')
ON CONFLICT (code) DO NOTHING;

-- Grant dashboard.view to admin and editor
-- We use a CTE to get the permission_id since role_permissions requires the UUID id, not the code
WITH dash_perm AS (
    SELECT id FROM public.permissions WHERE code = 'dashboard.view'
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'admin', id FROM dash_perm
UNION ALL
SELECT 'editor', id FROM dash_perm
ON CONFLICT (role_id, permission_id) DO NOTHING;
