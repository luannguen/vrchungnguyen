-- 01_database_schema.sql
-- COMPLETE VRC DATABASE SCHEMA
-- Generated: 2025-12-12
-- This file defines the entire database structure, types, functions, and RLS policies.
-- Does NOT include seed data (see 02_seed_data.sql).

-- ==========================================
-- 1. EXTENSIONS & TYPES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. USERS & ROLES SYSTEM
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

-- ==========================================
-- 3. CMS CONTENT TABLES
-- ==========================================

-- 3.1 Categories (Polymorphic)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('product', 'event', 'news', 'project')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.2 Products
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

-- 3.3 Events
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

-- 3.4 Projects
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

-- 3.5 News
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

-- 3.6 Contacts (Customer Inquiries)
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

-- 3.7 Navigation
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

-- 3.8 Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 4. FUNCTIONS & TRIGGERS
-- ==========================================

-- 4.1 Check Admin Helper
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

-- 4.2 Sync Auth User to Public User
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
-- 5. ROW LEVEL SECURITY (RLS)
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

-- 5.1 USERS Policies
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can select all users" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- 5.2 ROLES & PERMISSIONS Policies
CREATE POLICY "Authenticated can read roles" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated can read permissions" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated can read role_permissions" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_admin());

-- 5.3 PUBLIC READ FOR CMS
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public view news" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public view active navigation" ON public.navigation FOR SELECT USING (is_active = true);
CREATE POLICY "Public view settings" ON public.site_settings FOR SELECT USING (true);

-- 5.4 ADMIN WRITE FOR CMS
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage events" ON public.events FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage projects" ON public.projects FOR ALL USING (public.is_admin());
CREATE POLICY "Staff manage news" ON public.news FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage navigation" ON public.navigation FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- 5.5 CONTACTS POLICIES (Updated Fix)
-- Allow anyone (anon + auth) to INSERT contacts
CREATE POLICY "Public can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
-- Allow Admins to VIEW/MANAGE contacts
CREATE POLICY "Admins can select contacts" ON public.contacts FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update contacts" ON public.contacts FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete contacts" ON public.contacts FOR DELETE USING (public.is_admin());

-- GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
