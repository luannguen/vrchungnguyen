-- INIT_DATABASE.SQL
-- COMPLETE VRC DATABASE INITIALIZATION SCRIPT
-- Generated: 2025-12-12
-- This script handles Schema Creation, RLS Policies, and Data Seeding in one go.
-- It is designed to be idempotent (safe to run multiple times).

-- ==========================================
-- 1. EXTENSIONS & UTILITIES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLE DEFINITIONS
-- ==========================================

-- 2.1 Public Users Table (Syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 Roles Table (RBAC Definitions)
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY, -- 'admin', 'editor', 'user'
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 Permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- 'read:users', 'write:content'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 Role-Permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- 2.5 Categories (Polymorphic)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('product', 'event', 'news', 'project')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 Products
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

-- 2.7 Events
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

-- 2.8 Projects
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

-- 2.9 News
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

-- 2.10 Contacts (Customer Inquiries)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.11 Navigation
-- Consolidated definition including 'position' and 'type'
CREATE TABLE IF NOT EXISTS public.navigation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES public.navigation(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  children JSONB,
  position VARCHAR(50) DEFAULT 'header', -- Added: header | footer
  type VARCHAR(50) DEFAULT 'custom',     -- Added: internal | external | custom
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.12 Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.13 Static Pages
CREATE TABLE IF NOT EXISTS static_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 Resources (Tools, Statistics, etc.)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  content TEXT,
  icon TEXT NOT NULL, -- e.g. "LineChart", "Gauge"
  link TEXT,
  type TEXT DEFAULT 'category', -- 'category', 'tool', 'article'
  features JSONB DEFAULT '[]'::jsonb,
  parent_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

-- 3.1 Check Admin Helper
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

-- 3.2 Sync Auth User to Public User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
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
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 4.1 USERS Policies
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can select all users" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- 4.2 ROLES & PERMISSIONS Policies
CREATE POLICY "Authenticated can read roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated can read permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated can read role_permissions" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_admin());

-- 4.3 PUBLIC READ FOR CMS
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public view news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public view active navigation" ON public.navigation FOR SELECT USING (is_active = true);
CREATE POLICY "Public view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public view resources" ON public.resources FOR SELECT USING (true);

-- 4.4 ADMIN WRITE FOR CMS
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage events" ON public.events FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage projects" ON public.projects FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage news" ON public.news FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage navigation" ON public.navigation FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL USING (public.is_admin());

-- 4.5 CONTACTS POLICIES
CREATE POLICY "Public can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can select contacts" ON public.contacts FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update contacts" ON public.contacts FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete contacts" ON public.contacts FOR DELETE USING (public.is_admin());

-- 4.6 STATIC PAGES POLICIES
CREATE POLICY "Public Read Access" ON static_pages FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins manage static pages" ON static_pages FOR ALL USING (public.is_admin());

-- GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;


-- ==========================================
-- 5. SEED DATA
-- ==========================================

-- 5.1 Roles
INSERT INTO public.roles (id, name, description) VALUES
('admin', 'Administrator', 'Full system access'),
('editor', 'Editor', 'Can manage content'),
('user', 'User', 'Standard user access')
ON CONFLICT (id) DO NOTHING;

-- 5.2 Permissions
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

-- 5.3 Categories
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

-- 5.4 Site Settings
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

-- 5.5 Static Pages
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

-- 5.6 Resources (Seed Data)
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

    -- Child Data (Statistics)
    INSERT INTO public.resources (parent_id, title, slug, description, content, icon, type, features) VALUES
    (stats_id, 'Chỉ số hiệu suất năng lượng', 'energy-efficiency', 
     'Dữ liệu so sánh về các chỉ số EER/COP của các hệ thống điều hòa khác nhau.',
     '<h1>Chỉ số hiệu suất năng lượng (EER/COP)</h1><p>Nội dung chi tiết...</p>',
     'LineChart', 'article', '["EER vs COP", "Biểu đồ so sánh", "Xu hướng công nghệ"]'::jsonb),
     
    (stats_id, 'Chi phí vận hành và bảo trì', 'operating-costs',
     'Thống kê chi phí vận hành và bảo trì trung bình theo loại hệ thống.',
     '<h1>Chi phí vận hành</h1><p>Phân tích chi tiết...</p>',
     'BarChart3', 'article', '["Chi phí điện năng", "Chi phí bảo trì", "Tổng chi phí sở hữu (TCO)"]'::jsonb),
     
    (stats_id, 'Phân tích ROI và hoàn vốn', 'roi',
     'Dữ liệu về thời gian hoàn vốn đầu tư và ROI cho các hệ thống hiện đại.',
     '<h1>Phân tích ROI</h1><p>Cách tính toán thời gian hoàn vốn...</p>',
     'PieChart', 'article', '["Công thức tính ROI", "Ví dụ thực tế", "Yếu tố ảnh hưởng"]'::jsonb)
    ON CONFLICT (slug) DO NOTHING;

    -- Child Data (Tools)
    INSERT INTO public.resources (parent_id, title, slug, description, content, icon, type, features) VALUES
    (tools_id, 'Tính toán tải lạnh', 'cooling-load-calculator',
     'Công cụ tính toán tải lạnh giúp xác định công suất điều hòa phù hợp.',
     '<h1>Tính toán tải lạnh</h1><p>Nhập thông số phòng...</p>',
     'Calculator', 'tool', '["Diện tích phòng", "Vật liệu cách nhiệt", "Số người sử dụng"]'::jsonb),
     
    (tools_id, 'So sánh hiệu suất', 'efficiency-comparison',
     'Công cụ so sánh hiệu suất năng lượng và chi phí vận hành.',
     '<h1>So sánh hiệu suất</h1><p>Chọn các dòng máy...</p>',
     'BarChart3', 'tool', '["VRV vs Chiller", "Inverter vs Non-Inverter"]'::jsonb),
     
    (tools_id, 'Phân tích tiết kiệm năng lượng', 'energy-savings',
     'Tính toán lượng năng lượng tiết kiệm được khi nâng cấp hệ thống.',
     '<h1>Phân tích tiết kiệm</h1><p>Ước tính số tiền tiết kiệm...</p>',
     'Thermometer', 'tool', '["Tiết kiệm điện", "Giảm phát thải CO2"]'::jsonb),

    (tools_id, 'Tiêu chuẩn ngành HVAC', 'standards',
     'Các tiêu chuẩn ngành HVAC mới nhất.',
     '<h1>Tiêu chuẩn ngành HVAC</h1><p>Danh sách các tiêu chuẩn...</p>',
     'FileText', 'article', '["ASHRAE", "TCVN"]'::jsonb),

    (tools_id, 'Hướng dẫn thiết kế hệ thống', 'guidelines',
     'Hướng dẫn chi tiết quy trình thiết kế.',
     '<h1>Hướng dẫn thiết kế</h1><p>Quy trình từng bước...</p>',
     'BookOpen', 'article', '["Tính tải", "Chọn máy", "Thiết kế đường ống"]'::jsonb)
    ON CONFLICT (slug) DO NOTHING;
END $$;


-- 5.6 Navigation (Clean & Reseed)
DO $$
DECLARE
    footer_col_1 UUID;
    footer_col_2 UUID;
    footer_col_3 UUID;
BEGIN
    -- Delete existing navigation to prevent duplicates
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
