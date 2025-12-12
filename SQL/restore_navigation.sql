-- Completely reset navigation to ensure clean state
TRUNCATE TABLE public.navigation;

-- Insert Header Menu Items (Main Navigation)
INSERT INTO public.navigation (label, path, "order_index", is_active, position) VALUES
('Home', '/', 0, true, 'header'),
('About', '/about', 1, true, 'header'),
('Services', '/services', 2, true, 'header'),
('Projects', '/projects', 3, true, 'header'),
('News', '/news', 4, true, 'header'),
('Team', '/team', 5, true, 'header'),
('Contact', '/contact', 6, true, 'header');

