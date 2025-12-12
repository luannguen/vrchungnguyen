-- Clean up existing navigation items to avoid duplicates
TRUNCATE TABLE navigation;

-- Insert Header Menu Items
INSERT INTO navigation (label, path, "order_index", is_active, position) VALUES
('Home', '/', 0, true, 'header'),
('About', '/about', 1, true, 'header'),
('Products', '/products', 2, true, 'header'),
('News', '/news', 3, true, 'header'),
('Contact', '/contact', 4, true, 'header');

-- Insert Footer Menu Items
INSERT INTO navigation (label, path, "order_index", is_active, position) VALUES
('Privacy Policy', '/legal/privacy', 0, true, 'footer'),
('Terms of Use', '/legal/terms', 1, true, 'footer'),
('Cookie Policy', '/legal/cookie-policy', 2, true, 'footer'),
('Sitemap', '/sitemap', 3, true, 'footer');

-- Note: Static pages like Privacy Policy need to exist in 'static_pages' table for these links to work fully if they are dynamic.
-- But the route /legal/privacy etc should be handled by the frontend routing or StaticPage component.
