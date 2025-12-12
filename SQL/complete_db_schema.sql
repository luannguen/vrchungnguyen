-- COMPLETE DATABASE SCHEMA FOR VRC PROJECT
-- This script consolidates all previous migrations into a single file.
-- Order of execution:
-- 1. Extensions & Helpers
-- 2. Core Tables (Roles, Permissions)
-- 3. CMS Tables (Categories, Products, Events, Projects, News)
-- 4. Navigation & Settings
-- 5. RLS Policies & Security
-- 6. Seed Data

-- ==========================================
-- 1. EXTENSIONS & HELPER FUNCTIONS
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if current user is admin
-- Used in RLS policies for secure access control
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

-- ==========================================
-- 2. CORE ACCESS CONTROL (RBAC)
-- ==========================================

-- Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY, -- 'admin', 'editor', 'user'
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- 'read:users', 'write:content'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Role-Permissions Join Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- ==========================================
-- 3. CMS CONTENT TABLES
-- ==========================================

-- Drop existing tables to ensure schema updates (e.g. adding slug) are applied
-- CAUTION: This deletes existing CMS data.
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Categories (Polymorphic)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('product', 'event', 'news', 'project')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    price TEXT,
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT,
    image_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    organizer TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'past')),
    category_id UUID REFERENCES public.categories(id),
    participants_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT,
    image_url TEXT,
    client TEXT,
    completion_date TIMESTAMP WITH TIME ZONE,
    category_id UUID REFERENCES public.categories(id),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- News
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT,
    image_url TEXT,
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    author TEXT,
    category_id UUID REFERENCES public.categories(id),
    tags TEXT[],
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. SYSTEM & NAVIGATION
-- ==========================================

-- Navigation
CREATE TABLE IF NOT EXISTS public.navigation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES public.navigation(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  children JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 5.1 USERS Policies
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can select all users" ON public.users;
CREATE POLICY "Admins can select all users" ON public.users FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- 5.2 ROLES & PERMISSIONS Policies
DROP POLICY IF EXISTS "Authenticated can read roles" ON public.roles;
CREATE POLICY "Authenticated can read roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can read permissions" ON public.permissions;
CREATE POLICY "Authenticated can read permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can read role_permissions" ON public.role_permissions;
CREATE POLICY "Authenticated can read role_permissions" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage permissions" ON public.permissions;
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_admin());

-- 5.3 CMS PUBLIC READ Policies
DROP POLICY IF EXISTS "Public view categories" ON public.categories;
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view products" ON public.products;
CREATE POLICY "Public view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view events" ON public.events;
CREATE POLICY "Public view events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view projects" ON public.projects;
CREATE POLICY "Public view projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view news" ON public.news;
CREATE POLICY "Public view news" ON public.news FOR SELECT USING (true);

-- 5.4 CMS ADMIN WRITE Policies
DROP POLICY IF EXISTS "Staff manage categories" ON public.categories;
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor', 'super_admin'))
);

DROP POLICY IF EXISTS "Staff manage products" ON public.products;
CREATE POLICY "Staff manage products" ON public.products FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor', 'super_admin'))
);

DROP POLICY IF EXISTS "Staff manage events" ON public.events;
CREATE POLICY "Staff manage events" ON public.events FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor', 'super_admin'))
);

DROP POLICY IF EXISTS "Staff manage projects" ON public.projects;
CREATE POLICY "Staff manage projects" ON public.projects FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor', 'super_admin'))
);

DROP POLICY IF EXISTS "Staff manage news" ON public.news;
CREATE POLICY "Staff manage news" ON public.news FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor', 'super_admin'))
);

-- 5.5 NAVIGATION & SETTINGS Policies
DROP POLICY IF EXISTS "Public view active navigation" ON public.navigation;
CREATE POLICY "Public view active navigation" ON public.navigation FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage navigation" ON public.navigation;
CREATE POLICY "Admins manage navigation" ON public.navigation FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public view settings" ON public.site_settings;
CREATE POLICY "Public view settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- ==========================================
-- 6. SEED DATA
-- ==========================================

-- ==========================================
-- 6. SEED DATA
-- ==========================================

-- Roles
INSERT INTO public.roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('editor', 'Editor', 'Can manage content'),
('user', 'User', 'Standard user access')
ON CONFLICT (id) DO NOTHING;

-- Permissions
INSERT INTO public.permissions (code, description) VALUES
('read:users', 'Can view user list'),
('write:users', 'Can manage users'),
('read:content', 'Can view content'),
('write:content', 'Can create/edit content'),
('delete:content', 'Can delete content'),
('manage:settings', 'Can manage system settings')
ON CONFLICT (code) DO NOTHING;

-- Role Permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'admin', id FROM public.permissions ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'editor', id FROM public.permissions WHERE code IN ('read:users', 'read:content', 'write:content') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 'user', id FROM public.permissions WHERE code IN ('read:content') ON CONFLICT DO NOTHING;

-- Categories Seed
INSERT INTO public.categories (name, slug, type) VALUES 
-- Product Categories
('Công nghiệp', 'industrial', 'product'),
('Thương mại', 'commercial', 'product'),
('Dân dụng', 'residential', 'product'),
('Kho lạnh', 'cold-storage', 'product'),
('Phụ trợ', 'auxiliary', 'product'),
-- Event Categories
('Triển lãm', 'exhibition', 'event'),
('Hội thảo', 'workshop', 'event'),
('Đào tạo', 'training', 'event'),
-- News Categories
('Tin công ty', 'company-news', 'news'),
('Công nghệ mới', 'technology', 'news'),
('Giải thưởng', 'awards', 'news'),
-- Project Categories
('Dự án Công nghiệp', 'project-industrial', 'project'),
('Dự án Thương mại', 'project-commercial', 'project'),
('Dự án Y tế', 'project-medical', 'project')
ON CONFLICT (slug) DO NOTHING;

-- Navigation Seed
DELETE FROM public.navigation;
INSERT INTO public.navigation (label, path, order_index, is_active) VALUES
('Trang chủ', '/', 1, true),
('Sản phẩm', '/products', 2, true),
('Dịch vụ', '/services', 3, true),
('Dự án', '/projects', 4, true),
('Tin tức', '/news', 5, true),
('Liên hệ', '/contact', 6, true);

-- Site Settings Seed
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', 'VRC - Vietnam Refrigeration Company', 'Tên hiển thị của website'),
('contact_email', 'contact@vrc.com.vn', 'Email liên hệ chính'),
('contact_phone', '0123 456 789', 'Số điện thoại liên hệ'),
('contact_address', 'Số 123, Đường ABC, TP.HCM', 'Địa chỉ liên hệ'),
('copyright_text', '© 2024 VRC. All rights reserved.', 'Văn bản bản quyền dưới footer')
ON CONFLICT (key) DO NOTHING;

-- Seed Content (Products, Events, Projects, News)
DO $$
DECLARE
    -- Product Categories
    cat_industrial UUID;
    cat_commercial UUID;
    cat_residential UUID;
    cat_cold UUID;
    
    -- Event Categories
    cat_exhibition UUID;
    cat_workshop UUID;
    cat_training UUID;
    
    -- News Categories
    cat_company UUID;
    cat_tech UUID;
    cat_awards UUID;
    
    -- Project Categories
    cat_proj_industrial UUID;
    cat_proj_commercial UUID;
    cat_proj_medical UUID;
BEGIN
    -- Fetch Category IDs
    SELECT id INTO cat_industrial FROM public.categories WHERE slug = 'industrial';
    SELECT id INTO cat_commercial FROM public.categories WHERE slug = 'commercial';
    SELECT id INTO cat_residential FROM public.categories WHERE slug = 'residential';
    SELECT id INTO cat_cold FROM public.categories WHERE slug = 'cold-storage';
    
    SELECT id INTO cat_exhibition FROM public.categories WHERE slug = 'exhibition';
    SELECT id INTO cat_workshop FROM public.categories WHERE slug = 'workshop';
    SELECT id INTO cat_training FROM public.categories WHERE slug = 'training';
    
    SELECT id INTO cat_company FROM public.categories WHERE slug = 'company-news';
    SELECT id INTO cat_tech FROM public.categories WHERE slug = 'technology';
    SELECT id INTO cat_awards FROM public.categories WHERE slug = 'awards';
    
    SELECT id INTO cat_proj_industrial FROM public.categories WHERE slug = 'project-industrial';
    SELECT id INTO cat_proj_commercial FROM public.categories WHERE slug = 'project-commercial';
    SELECT id INTO cat_proj_medical FROM public.categories WHERE slug = 'project-medical';

    -- PRODUCTS SEED
    INSERT INTO public.products (name, slug, description, category_id, price, is_new, is_bestseller, image_url, features, specifications) VALUES
    (
        'Máy nén khí trục vít VRC-100',
        'may-nen-khi-truc-vit-vrc-100',
        'Máy nén khí công nghiệp hiệu suất cao, tiết kiệm năng lượng, phù hợp cho nhà máy sản xuất quy mô lớn.',
        cat_industrial,
        'Liên hệ',
        true,
        true,
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        '["Hiệu suất cao", "Tiết kiệm 30% điện năng", "Hoạt động êm ái"]',
        '{"power": "100HP", "pressure": "8-10 bar", "capacity": "12m3/min"}'
    ),
    (
        'Tháp giải nhiệt VRC-Tower 500RT',
        'thap-giai-nhiet-vrc-tower-500rt',
        'Tháp giải nhiệt cooling tower công suất lớn, chống ăn mòn, tuổi thọ cao.',
        cat_industrial,
        'Liên hệ',
        false,
        true,
        'https://images.unsplash.com/photo-1565514020176-8519ae566836',
        '["Vỏ composite bền bỉ", "Cánh quạt thiết kế khí động học", "Dễ dàng bảo trì"]',
        '{"cooling_capacity": "500RT", "airflow": "3500 m3/min", "motor": "15kW"}'
    ),
    (
        'Điều hòa trung tâm VRV IV',
        'dieu-hoa-trung-tam-vrv-iv',
        'Hệ thống điều hòa không khí trung tâm VRV IV thông minh, giải pháp toàn diện cho tòa nhà thương mại.',
        cat_commercial,
        'Liên hệ',
        true,
        true,
        'https://images.unsplash.com/photo-1504384308090-c54be3855833',
        '["Điều khiển thông minh", "Kết nối BMS", "COP cao"]',
        '{"type": "Outdoor Unit", "capacity": "10-60HP", "refrigerant": "R410A"}'
    ),
    (
        'Cassette âm trần 4 hướng thổi',
        'cassette-am-tran-4-huong-thoi',
        'Máy lạnh cassette âm trần sang trọng, phân phối gió đều 4 hướng, thích hợp cho văn phòng, nhà hàng.',
        cat_commercial,
        '25,000,000 VND',
        false,
        false,
        'https://images.unsplash.com/photo-1618220179428-22790b461013',
        '["Mặt nạ vuông đồng nhất", "Bơm nước xả tiêu chuẩn", "Cảm biến người dùng"]',
        '{"capacity": "24000 BTU", "power_supply": "1 Phase, 220V", "gas": "R32"}'
    ),
    (
        'Cụm máy nén dàn ngưng Bitzer',
        'cum-may-nen-dan-ngung-bitzer',
        'Cụm máy nén dàn ngưng nhập khẩu nguyên cụm, chuyên dụng cho kho lạnh, kho bảo quản thực phẩm.',
        cat_cold,
        'Liên hệ',
        true,
        false,
        'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5',
        '["Máy nén Bitzer Đức", "Lên đến -40 độ C", "Tiết kiệm điện"]',
        '{"compressor": "Semi-hermetic", "condenser": "Air cooled", "temp_range": "-5 to -40C"}'
    )
    ON CONFLICT (slug) DO NOTHING;

    -- PROJECTS SEED
    INSERT INTO public.projects (name, slug, description, content, image_url, client, completion_date, category_id, is_featured) VALUES
    (
        'Hệ thống lạnh Nhà máy Chế biến Thủy sản Minh Phú',
        'du-an-minh-phu',
        'Cung cấp và lắp đặt hệ thống cấp đông IQF và kho lạnh bảo quản công suất 5000 tấn.',
        '<p>Chi tiết dự án đang cập nhật...</p>',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e',
        'Tập đoàn Thủy sản Minh Phú',
        '2024-12-01 00:00:00+00',
        cat_proj_industrial,
        true
    ),
    (
        'Điều hòa không khí Tòa nhà Vietcombank Tower',
        'du-an-vietcombank-tower',
        'Thi công hệ thống điều hòa không khí trung tâm Chiller và cấp khí tươi cho toàn bộ tòa nhà văn phòng.',
        '<p>Chi tiết dự án đang cập nhật...</p>',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
        'Vietcombank',
        '2024-10-15 00:00:00+00',
        cat_proj_commercial,
        true
    ),
    (
        'Kho lạnh Dược phẩm DHG Pharma',
        'du-an-dhg-pharma',
        'Lắp đặt hệ thống kho lạnh đạt chuẩn GSP bảo quản thuốc và vắc xin.',
        '<p>Chi tiết dự án đang cập nhật...</p>',
        'https://images.unsplash.com/photo-1576091160550-217358c7c8c8',
        'DHG Pharma',
        '2024-08-20 00:00:00+00',
        cat_proj_medical,
        false
    )
    ON CONFLICT (slug) DO NOTHING;

    -- EVENTS SEED
    INSERT INTO public.events (title, slug, summary, content, image_url, start_date, location, organizer, status, category_id, tags)
    VALUES (
        'Triển lãm Quốc tế về Hệ thống Lạnh và Điều hòa Không khí 2025',
        'trien-lam-quoc-te-lanh-2025',
        'Sự kiện triển lãm quốc tế lớn nhất trong năm 2025 về các giải pháp và sản phẩm mới trong lĩnh vực hệ thống làm lạnh và điều hòa không khí...',
        '<p>Chào mừng quý vị đến với Triển lãm Quốc tế...</p>',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        '2025-05-15 09:00:00+00',
        'Trung tâm Hội chợ và Triển lãm Sài Gòn (SECC), Quận 7, TP.HCM',
        'Hiệp hội Điện lạnh Việt Nam',
        'upcoming',
        cat_exhibition,
        ARRAY['Triển lãm', 'Điều hòa', 'Công nghệ làm lạnh']
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.events (title, slug, summary, content, image_url, start_date, location, organizer, status, category_id, tags)
    VALUES (
        'Hội thảo Công nghệ Tiết kiệm Năng lượng trong Hệ thống Lạnh',
        'hoi-thao-tiet-kiem-nang-luong',
        'Hội thảo chuyên sâu về các công nghệ tiết kiệm năng lượng mới nhất áp dụng trong hệ thống lạnh công nghiệp và thương mại...',
        '<p>Trân trọng kính mời quý đơn vị...</p>',
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
        '2025-04-20 08:30:00+00',
        'Khách sạn Melia, 44 Lý Thường Kiệt, Hà Nội',
        'VRC',
        'upcoming',
        cat_workshop,
        ARRAY['Tiết kiệm năng lượng', 'Công nghệ mới', 'Hệ thống lạnh']
    ) ON CONFLICT (slug) DO NOTHING;

    -- NEWS SEED
    INSERT INTO public.news (title, slug, summary, content, image_url, publish_date, author, category_id, tags, views)
    VALUES (
        'Khóa đào tạo Kỹ thuật viên Bảo trì Hệ thống Lạnh Công nghiệp',
        'khoa-dao-tao-ky-thuat-vien',
        'Khóa đào tạo chuyên sâu dành cho kỹ thuật viên về quy trình bảo trì, sửa chữa và nâng cấp các hệ thống lạnh công nghiệp quy mô lớn...',
        '<p>Nội dung chi tiết đang được cập nhật...</p>',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
        '2025-03-20 00:00:00+00',
        'VRC Academy',
        cat_training,
        ARRAY['Đào tạo kỹ thuật', 'Bảo trì', 'Hệ thống lạnh công nghiệp'],
        421
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.news (title, slug, summary, content, image_url, publish_date, author, category_id, tags, views)
    VALUES (
        'VRC ký kết hợp tác với tập đoàn điện lạnh hàng đầu châu Âu',
        'vrc-ky-ket-hop-tac-chau-au',
        'VRC vừa ký kết thỏa thuận hợp tác chiến lược với tập đoàn điện lạnh hàng đầu châu Âu, mở rộng cơ hội phát triển thị trường và chuyển giao công nghệ...',
        '<p>Nội dung chi tiết đang được cập nhật...</p>',
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
        '2025-03-15 00:00:00+00',
        'Phòng Truyền thông',
        cat_company,
        ARRAY['Hợp tác quốc tế', 'Phát triển', 'Công nghệ mới'],
        890
    ) ON CONFLICT (slug) DO NOTHING;

END $$;
