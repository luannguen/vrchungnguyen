-- 04_resources_details.sql
-- Add hierarchy and content support to resources table

-- 1. Alter Table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'category'; -- 'category' or 'tool'/'article'

-- 2. Update Parent Resources (Seed slugs)
-- We use the titles to identify them. 
-- Note: 'Dữ liệu & Thống kê năng lượng' -> 'statistics'
-- Note: 'Công cụ tính toán & Thiết kế' -> 'tools'
UPDATE public.resources 
SET slug = 'statistics', type = 'category'
WHERE title = 'Dữ liệu & Thống kê năng lượng';

UPDATE public.resources 
SET slug = 'tools', type = 'category'
WHERE title = 'Công cụ tính toán & Thiết kế';

-- 3. Seed Child Data
-- Only insert if parents exist (which they should)

DO $$ 
DECLARE 
    stats_id UUID;
    tools_id UUID;
BEGIN
    SELECT id INTO stats_id FROM public.resources WHERE slug = 'statistics';
    SELECT id INTO tools_id FROM public.resources WHERE slug = 'tools';

    -- Statistics Children
    IF stats_id IS NOT NULL THEN
        INSERT INTO public.resources (parent_id, title, slug, description, content, icon, type, features) VALUES
        (stats_id, 'Chỉ số hiệu suất năng lượng', 'energy-efficiency', 
         'Dữ liệu so sánh về các chỉ số EER/COP của các hệ thống điều hòa khác nhau.',
         '<h1>Chỉ số hiệu suất năng lượng (EER/COP)</h1><p>Nội dung chi tiết về chỉ số hiệu suất năng lượng...</p>',
         'LineChart', 'article', '["EER vs COP", "Biểu đồ so sánh", "Xu hướng công nghệ"]'::jsonb),
         
        (stats_id, 'Chi phí vận hành và bảo trì', 'operating-costs',
         'Thống kê chi phí vận hành và bảo trì trung bình theo loại hệ thống.',
         '<h1>Chi phí vận hành</h1><p>Phân tích chi tiết về chi phí...</p>',
         'BarChart3', 'article', '["Chi phí điện năng", "Chi phí bảo trì", "Tổng chi phí sở hữu (TCO)"]'::jsonb),
         
        (stats_id, 'Phân tích ROI và hoàn vốn', 'roi',
         'Dữ liệu về thời gian hoàn vốn đầu tư và ROI cho các hệ thống hiện đại.',
         '<h1>Phân tích ROI</h1><p>Cách tính toán thời gian hoàn vốn...</p>',
         'PieChart', 'article', '["Công thức tính ROI", "Ví dụ thực tế", "Yếu tố ảnh hưởng"]'::jsonb)
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    -- Tools Children
    IF tools_id IS NOT NULL THEN
        INSERT INTO public.resources (parent_id, title, slug, description, content, icon, type, features) VALUES
        (tools_id, 'Tính toán tải lạnh', 'cooling-load-calculator',
         'Công cụ tính toán tải lạnh giúp xác định công suất điều hòa phù hợp.',
         '<h1>Tính toán tải lạnh</h1><p>Nhập thông số phòng để tính toán...</p>',
         'Calculator', 'tool', '["Diện tích phòng", "Vật liệu cách nhiệt", "Số người sử dụng"]'::jsonb),
         
        (tools_id, 'So sánh hiệu suất', 'efficiency-comparison',
         'Công cụ so sánh hiệu suất năng lượng và chi phí vận hành.',
         '<h1>So sánh hiệu suất</h1><p>Chọn các dòng máy để so sánh...</p>',
         'BarChart3', 'tool', '["VRV vs Chiller", "Inverter vs Non-Inverter"]'::jsonb),
         
        (tools_id, 'Phân tích tiết kiệm năng lượng', 'energy-savings',
         'Tính toán lượng năng lượng tiết kiệm được khi nâng cấp hệ thống.',
         '<h1>Phân tích tiết kiệm</h1><p>Ước tính số tiền tiết kiệm được...</p>',
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
    END IF;

END $$;
