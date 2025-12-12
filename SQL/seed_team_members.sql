-- Clean up existing team members to avoid duplicates during dev
DELETE FROM public.team_members;

-- Seed Team Members
INSERT INTO public.team_members (name, role, bio, image_url, social_links, display_order)
VALUES
(
    'Nguyễn Văn A',
    'CEO & Founder',
    'Hơn 15 năm kinh nghiệm trong ngành điện lạnh và quản lý dự án.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    '{"linkedin": "https://linkedin.com", "twitter": "https://twitter.com", "email": "ceo@vrc.com.vn"}'::jsonb,
    1
),
(
    'Trần Thị B',
    'Giám đốc Kỹ thuật',
    'Chuyên gia về thiết kế hệ thống HVAC và giải pháp tiết kiệm năng lượng.',
    'https://images.unsplash.com/photo-1573496359-136d47558363?auto=format&fit=crop&q=80&w=400',
    '{"linkedin": "https://linkedin.com", "email": "cto@vrc.com.vn"}'::jsonb,
    2
),
(
    'Lê Văn C',
    'Trưởng phòng Kinh doanh',
    'Am hiểu thị trường và luôn tận tâm với khách hàng.',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    '{"facebook": "https://facebook.com", "email": "sales@vrc.com.vn"}'::jsonb,
    3
),
(
    'Phạm Thị D',
    'Kiến trúc sư trưởng',
    'Sáng tạo và chi tiết trong từng bản vẽ thiết kế.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    '{"instagram": "https://instagram.com", "email": "design@vrc.com.vn"}'::jsonb,
    4
);
