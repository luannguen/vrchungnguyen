-- 02_seed_data.sql
-- SEED DATA FOR VRC PROJECT
-- Run this AFTER 01_database_schema.sql

-- 1. Roles
INSERT INTO public.roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('editor', 'Editor', 'Can manage content'),
('user', 'User', 'Standard user access')
ON CONFLICT (id) DO NOTHING;

-- 2. Permissions
INSERT INTO public.permissions (code, description) VALUES
('read:users', 'Can view user list'),
('write:users', 'Can manage users'),
('read:content', 'Can view content'),
('write:content', 'Can create/edit content'),
('delete:content', 'Can delete content'),
('manage:settings', 'Can manage system settings')
ON CONFLICT (code) DO NOTHING;

-- Map Admin Permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'admin', id FROM public.permissions ON CONFLICT DO NOTHING;

-- 3. Categories
INSERT INTO public.categories (name, slug, type) VALUES 
('Công nghiệp', 'industrial', 'product'),
('Thương mại', 'commercial', 'product'),
('Dân dụng', 'residential', 'product'),
('Kho lạnh', 'cold-storage', 'product'),
('Triển lãm', 'exhibition', 'event'),
('Hội thảo', 'workshop', 'event'),
('Tin công ty', 'company-news', 'news'),
('Công nghệ mới', 'technology', 'news'),
('Dự án Công nghiệp', 'project-industrial', 'project'),
('Dự án Thương mại', 'project-commercial', 'project')
ON CONFLICT (slug) DO NOTHING;

-- 4. Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', 'VRC - Vietnam Refrigeration Company', 'Tên hiển thị của website'),
('contact_email', 'contact@vrc.com.vn', 'Email liên hệ'),
('contact_phone', '0123 456 789', 'Hotline')
ON CONFLICT (key) DO NOTHING;

-- 5. Navigation
DELETE FROM public.navigation;
INSERT INTO public.navigation (label, path, order_index, is_active) VALUES
('Trang chủ', '/', 1, true),
('Sản phẩm', '/products', 2, true),
('Dịch vụ', '/services', 3, true),
('Dự án', '/projects', 4, true),
('Tin tức', '/news', 5, true),
('Liên hệ', '/contact', 6, true);

-- 6. Sample Content (Safe to run multiple times due to ON CONFLICT)
-- (Simplified for brevity, refer to original logs for full text if needed)
DO $$
DECLARE
    cat_industrial UUID;
BEGIN
    SELECT id INTO cat_industrial FROM public.categories WHERE slug = 'industrial';
    
    INSERT INTO public.products (name, slug, description, category_id, price, is_new, image_url) VALUES
    ('Máy nén khí VRC-100', 'may-nen-khi-vrc-100', 'Máy nén khí công nghiệp', cat_industrial, 'Liên hệ', true, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')
    ON CONFLICT (slug) DO NOTHING;
END $$;
