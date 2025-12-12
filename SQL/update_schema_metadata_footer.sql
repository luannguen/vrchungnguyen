-- Add 'position' column to navigation table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'navigation' AND column_name = 'position') THEN
        ALTER TABLE navigation ADD COLUMN position VARCHAR(50) DEFAULT 'header';
    END IF;
END $$;

-- Update existing items to be 'header' by default
UPDATE navigation SET position = 'header' WHERE position IS NULL;

-- Seed Footer Data (Example structure)
-- Assuming we have a way to identify these, but for now we'll just insert if empty/not exists logic could be complex without unique constraints.
-- We'll rely on Admin UI to create them, but let's ensure the column exists.

-- Seed SEO Settings
INSERT INTO site_settings (key, value) VALUES
('site_title', 'VRC - Tổng công ty kỹ thuật điện lạnh Việt Nam'),
('site_description', 'Giải pháp điện lạnh toàn diện cho mọi công trình'),
('site_keywords', 'điện lạnh, vrc, hvac, construction'),
('og_image_url', '/lovable-uploads/0bd3c048-8e37-4775-a6bc-0b54ec07edbe.png'),
('header_scripts', ''),
('footer_scripts', ''),
('contact_email', 'info@vrc.com.vn'),
('contact_phone', '028 1234 5678'),
('contact_address', '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh'),
('copyright_text', '© 2025 VRC - Tổng công ty kỹ thuật điện lạnh Việt Nam. Tất cả quyền được bảo lưu.')
ON CONFLICT (key) DO NOTHING;
