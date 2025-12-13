-- 02_permissions.sql
-- VRC Database Permissions & RLS
-- Generated: 2025-12-13
-- Contains: RLS Enabling, Policies, and GRANTS

-- ==========================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ==========================================
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
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POLICIES
-- ==========================================

-- 2.1 USERS Policies
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can select all users" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- 2.2 ROLES & PERMISSIONS Policies
CREATE POLICY "Authenticated can read roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated can read permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated can read role_permissions" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_admin());

-- 2.3 PUBLIC READ FOR CMS
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public view news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public view active navigation" ON public.navigation FOR SELECT USING (is_active = true);
CREATE POLICY "Public view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public view resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public view achievements" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Public view faqs" ON public.faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public view team_members" ON public.team_members FOR SELECT USING (true);

-- 2.4 ADMIN/STAFF WRITE POLICIES
-- Note: is_admin() checks for 'admin' or 'super_admin'
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage events" ON public.events FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage projects" ON public.projects FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage news" ON public.news FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage navigation" ON public.navigation FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage achievements" ON public.achievements FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL USING (public.is_admin());

-- Team Members Management (Restricted to authenticated/admins)
CREATE POLICY "Admins manage team_members" ON public.team_members FOR ALL USING (public.is_admin());

-- 2.5 CONTACTS POLICIES
CREATE POLICY "Public can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can select contacts" ON public.contacts FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update contacts" ON public.contacts FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete contacts" ON public.contacts FOR DELETE USING (public.is_admin());

-- 2.6 STATIC PAGES POLICIES
CREATE POLICY "Public Read Access" ON static_pages FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins manage static pages" ON static_pages FOR ALL USING (public.is_admin());

-- ==========================================
-- 3. GRANTS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
