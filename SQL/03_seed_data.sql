-- 03_seed_data.sql
-- VRC Database Seed Data
-- Generated: 2025-12-13
-- Contains: Roles, Permissions, Initial Content

-- ==========================================
-- 1. BASE DATA (Roles & Permissions)
-- ==========================================

-- 1.1 Roles
INSERT INTO public.roles (id, name, description) VALUES
('super_admin', 'Super Administrator', 'Has full system access and can manage all aspects of the platform.'),
('admin', 'Administrator', 'Full system access'),
('editor', 'Editor', 'Can manage content but not users or system settings'),
('user', 'User', 'Standard user access')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 1.2 Permissions
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

-- Dashboard Access
('dashboard.view', 'Access the admin dashboard'),

-- System Settings
('settings.view', 'View system settings'),
('settings.manage', 'Manage system settings')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- 1.3 Role-Permissions Assignment

-- ADMIN: All Permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- EDITOR: Content Management + View Users (but not create/delete users or settings)
-- Includes dashboard.view
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'editor', id FROM public.permissions 
WHERE code IN (
    'content.view', 'content.create', 'content.edit', 'content.delete',
    'users.view', 'dashboard.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;


-- ==========================================
-- 2. CONTENT SEEDING
-- ==========================================

-- 2.1 Categories
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

-- 2.2 Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', 'VRC', 'Tên ngắn của website'),
('site_title', 'VRC - Tổng công ty kỹ thuật điện lạnh Việt Nam', 'Tiêu đề đầy đủ'),
('site_description', 'Giải pháp điện lạnh toàn diện cho mọi công trình. Uy tín, Chất lượng, Hiệu quả.', 'Mô tả SEO'),
('site_keywords', 'điện lạnh, vrc, hvac, construction, cơ điện lạnh, bảo trì', 'Từ khóa SEO'),
('og_image_url', '/lovable-uploads/0bd3c048-8e37-4775-a6bc-0b54ec07edbe.png', 'Ảnh chia sẻ MXH'),
('contact_email', 'info@vrc.com.vn', 'Email liên hệ'),
('contact_phone', '028 3833 3333', 'Hotline'),
('contact_address', '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh', 'Địa chỉ'),
('copyright_text', '© 2025 VRC - Tổng công ty kỹ thuật điện lạnh Việt Nam. Tất cả quyền được bảo lưu.', 'Text bản quyền')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2.3 Achievements
INSERT INTO public.achievements (label, value, sort_order) VALUES
('Dự án đã hoàn thành', '500+', 1),
('Năm kinh nghiệm', '20+', 2),
('Đối tác lớn', '50+', 3),
('Kỹ sư & nhân viên', '100+', 4)
ON CONFLICT DO NOTHING;

-- 2.4 FAQs
INSERT INTO public.faqs (question, answer, sort_order, category) VALUES
(
    'Làm thế nào để chọn công suất điều hòa phù hợp?',
    'Để chọn công suất điều hòa phù hợp, bạn cần tính toán dựa trên diện tích phòng, số người sử dụng, hướng phòng, thiết bị sinh nhiệt trong phòng và vị trí địa lý. Thông thường, cần 9.000 BTU cho phòng 15m², 12.000 BTU cho phòng 20m², 18.000 BTU cho phòng 30m². Với không gian công nghiệp hoặc thương mại, VRC có đội ngũ kỹ sư sẽ tính toán chi tiết và đề xuất giải pháp tối ưu.',
    1,
    'product'
),
(
    'Thời gian bảo hành cho các sản phẩm của VRC là bao lâu?',
    'VRC cung cấp chế độ bảo hành 24 tháng cho tất cả các sản phẩm điều hòa dân dụng, 36 tháng đối với máy nén của hệ thống VRV/VRF, và 12 tháng đối với các thiết bị công nghiệp. Ngoài ra, chúng tôi có các gói bảo trì và gia hạn bảo hành để đảm bảo hệ thống của bạn luôn vận hành ổn định và hiệu quả trong suốt vòng đời sản phẩm.',
    2,
    'service'
),
(
    'Chi phí lắp đặt hệ thống kho lạnh phụ thuộc vào yếu tố nào?',
    'Chi phí lắp đặt kho lạnh phụ thuộc vào nhiều yếu tố như: diện tích kho, nhiệt độ yêu cầu, loại hàng hóa cần bảo quản, độ dày panel cách nhiệt, hệ thống điện, hệ thống giám sát, và các trang thiết bị đi kèm. VRC cung cấp giải pháp kho lạnh theo yêu cầu cụ thể của từng khách hàng với mức giá cạnh tranh nhất trên thị trường.',
    3,
    'pricing'
)
ON CONFLICT DO NOTHING;

-- 2.5 Static Pages
INSERT INTO static_pages (slug, title, content, excerpt) VALUES
(
    'chinh-sach-bao-mat', 
    'Chính sách bảo mật', 
    '<h1>Chính sách bảo mật</h1><p>VRC cam kết bảo mật thông tin cá nhân của khách hàng...</p><p>Nội dung đang cập nhật.</p>',
    'Cam kết của VRC về bảo mật thông tin khách hàng.'
),
(
    'dieu-khoan-su-dung', 
    'Điều khoản sử dụng', 
    '<h1>Điều khoản sử dụng</h1><p>Chào mừng bạn đến với website VRC...</p>',
    'Các quy định và điều khoản khi sử dụng dịch vụ của VRC.'
),
(
    'chinh-sach-cookie', 
    'Chính sách Cookie', 
    '<h1>Chính sách Cookie</h1><p>Website này sử dụng cookie để nâng cao trải nghiệm...</p>',
    'Thông tin về cách VRC sử dụng cookie trên website.'
),
(
    'about-us', 
    'Về chúng tôi', 
    '<h1>Về VRC</h1><p>Tổng công ty kỹ thuật điện lạnh Việt Nam (VRC) là đơn vị hàng đầu...</p>',
    'Giới thiệu tổng quan về lịch sử, sứ mệnh và tầm nhìn của VRC.'
),
(
    'intro', 
    'Giới thiệu chung', 
    '<h1>Giới thiệu chung</h1><p>Nội dung giới thiệu chi tiết...</p>',
    'Bài giới thiệu chi tiết về doanh nghiệp.'
)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

-- 2.6 Navigation
DO $$
DECLARE
    footer_col_1 UUID;
    footer_col_2 UUID;
    footer_col_3 UUID;
BEGIN
    -- Delete existing navigation to prevent duplicates (optional, use if full reset desire)
    DELETE FROM public.navigation;
    
    -- HEADER NAVIGATION
    INSERT INTO navigation (label, path, type, position, order_index, is_active) VALUES
    ('Trang chủ', '/', 'internal', 'header', 0, true),
    ('Giới thiệu', '/about-us', 'internal', 'header', 1, true),
    ('Sản phẩm', '/products', 'internal', 'header', 2, true),
    ('Dịch vụ', '/services', 'internal', 'header', 3, true),
    ('Dự án', '/projects', 'internal', 'header', 4, true),
    ('Tin tức', '/news', 'internal', 'header', 5, true),
    ('Liên hệ', '/contact', 'internal', 'header', 6, true);

    -- FOOTER NAVIGATION
    -- Column 1: Về VRC
    INSERT INTO navigation (label, path, type, position, order_index, is_active)
    VALUES ('Về VRC', '#', 'custom', 'footer', 1, true)
    RETURNING id INTO footer_col_1;

    INSERT INTO navigation (parent_id, label, path, type, position, order_index, is_active) VALUES
    (footer_col_1, 'Giới thiệu chung', '/about-us', 'internal', 'footer', 1, true),
    (footer_col_1, 'Hồ sơ năng lực', '/intro', 'internal', 'footer', 2, true),
    (footer_col_1, 'Tuyển dụng', '/careers', 'internal', 'footer', 3, true);

    -- Column 2: Dịch vụ & Hỗ trợ
    INSERT INTO navigation (label, path, type, position, order_index, is_active)
    VALUES ('Dịch vụ & Hỗ trợ', '#', 'custom', 'footer', 2, true)
    RETURNING id INTO footer_col_2;

    INSERT INTO navigation (parent_id, label, path, type, position, order_index, is_active) VALUES
    (footer_col_2, 'Tư vấn kỹ thuật', '/services/consulting', 'internal', 'footer', 1, true),
    (footer_col_2, 'Bảo trì & Sửa chữa', '/services/maintenance', 'internal', 'footer', 2, true),
    (footer_col_2, 'Liên hệ báo giá', '/contact', 'internal', 'footer', 3, true);

    -- Column 3: Chính sách
    INSERT INTO navigation (label, path, type, position, order_index, is_active)
    VALUES ('Chính sách', '#', 'custom', 'footer', 3, true)
    RETURNING id INTO footer_col_3;

    INSERT INTO navigation (parent_id, label, path, type, position, order_index, is_active) VALUES
    (footer_col_3, 'Chính sách bảo mật', '/chinh-sach-bao-mat', 'internal', 'footer', 1, true),
    (footer_col_3, 'Điều khoản sử dụng', '/dieu-khoan-su-dung', 'internal', 'footer', 2, true),
    (footer_col_3, 'Chính sách Cookie', '/chinh-sach-cookie', 'internal', 'footer', 3, true),
    (footer_col_3, 'Sơ đồ trang', '/legal/sitemap', 'internal', 'footer', 4, true);
END $$;

-- 2.7 Resources (Tools & Stats)
-- Only seeding simplified data here to avoid huge blocks. 
DO $$
DECLARE
    stats_id UUID;
    tools_id UUID;
BEGIN
    -- Parent Resources
    INSERT INTO public.resources (title, slug, description, icon, link, type, features)
    VALUES 
    ('Dữ liệu & Thống kê năng lượng', 'statistics', 
     'Truy cập dữ liệu phân tích và thống kê về hiệu suất năng lượng...', 
     'LineChart', '/data/statistics', 'category', 
     '["Chỉ số hiệu suất năng lượng (EER/COP)", "Chi phí vận hành và bảo trì", "Phân tích ROI và thời gian hoàn vốn", "Dữ liệu phát thải carbon và tác động môi trường"]'::jsonb)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO stats_id;

    -- If conflict happened, fetch id
    IF stats_id IS NULL THEN
        SELECT id INTO stats_id FROM public.resources WHERE slug = 'statistics';
    END IF;

    INSERT INTO public.resources (title, slug, description, icon, link, type, features)
    VALUES
    ('Công cụ tính toán & Thiết kế', 'tools', 
     'Sử dụng các công cụ tính toán và thiết kế để lựa chọn hệ thống...', 
     'Gauge', '/data/tools', 'category',
     '["Tính toán tải lạnh cho không gian", "So sánh hiệu suất và chi phí giữa các hệ thống", "Phân tích tiết kiệm năng lượng và giảm chi phí", "Tư vấn lựa chọn giải pháp phù hợp"]'::jsonb)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO tools_id;

    -- If conflict happened, fetch id
    IF tools_id IS NULL THEN
        SELECT id INTO tools_id FROM public.resources WHERE slug = 'tools';
    END IF;
END $$;
