-- Create navigation table
CREATE TABLE IF NOT EXISTS public.navigation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES public.navigation(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  children JSONB, -- Optional cache or structure if needed, but relation is recursive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for navigation
-- Everyone can read active navigation items
CREATE POLICY "Public can view active navigation" 
  ON public.navigation FOR SELECT 
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage navigation" 
  ON public.navigation FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for site_settings
-- Everyone can read settings (or maybe restrict sensitive ones? For now allow read)
CREATE POLICY "Public can view settings" 
  ON public.site_settings FOR SELECT 
  USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings" 
  ON public.site_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Seed Data for Navigation (replicating current MainNavigation)
INSERT INTO public.navigation (label, path, order_index, is_active) VALUES
('Trang chủ', '/', 1, true),
('Sản phẩm', '/products', 2, true),
('Dịch vụ', '/services', 3, true),
('Dự án', '/projects', 4, true),
('Tin tức', '/news', 5, true),
('Liên hệ', '/contact', 6, true);

-- Seed Data for Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', 'VRC - Vietnam Refrigeration Company', 'Tên hiển thị của website'),
('contact_email', 'contact@vrc.com.vn', 'Email liên hệ chính'),
('contact_phone', '0123 456 789', 'Số điện thoại liên hệ'),
('contact_address', 'Số 123, Đường ABC, TP.HCM', 'Địa chỉ liên hệ'),
('copyright_text', '© 2024 VRC. All rights reserved.', 'Văn bản bản quyền dưới footer');
