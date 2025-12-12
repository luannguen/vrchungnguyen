-- 02_create_content_tables.sql
-- Create Achievements and FAQs tables with RLS and Seed Data

-- ==========================================
-- 1. TABLE DEFINITIONS
-- ==========================================

-- 1.1 Achievements (Stats)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    icon TEXT, -- Lucide icon name or image URL
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.2 FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- 2.1 Achievements Policies
CREATE POLICY "Public view achievements" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL USING (public.is_admin());

-- 2.2 FAQs Policies
CREATE POLICY "Public view faqs" ON public.faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL USING (public.is_admin());

-- ==========================================
-- 3. SEED DATA
-- ==========================================

-- 3.1 Seed Achievements
INSERT INTO public.achievements (label, value, sort_order) VALUES
('Dự án đã hoàn thành', '500+', 1),
('Năm kinh nghiệm', '20+', 2),
('Đối tác lớn', '50+', 3),
('Kỹ sư & nhân viên', '100+', 4)
ON CONFLICT DO NOTHING;

-- 3.2 Seed FAQs
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
