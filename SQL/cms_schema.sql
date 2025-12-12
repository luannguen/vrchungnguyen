-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
-- Polymorphic categories for different content types (product, event, news, project)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('product', 'event', 'news', 'project')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id),
    price TEXT, -- Storing as text to handle ranges or "Contact"
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb, -- Array of strings
    specifications JSONB DEFAULT '{}'::jsonb, -- Key-value pairs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT, -- HTML content
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

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT, -- Detail HTML content
    image_url TEXT,
    client TEXT,
    completion_date TIMESTAMP WITH TIME ZONE,
    category_id UUID REFERENCES public.categories(id),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 5. NEWS TABLE (If separating from Events, but Events table structure is similar. 
-- For now, let's assume News uses the same 'events' table or a separate one if fields differ significantly.
-- Based on current code, they share structure. We can use a 'news' table or just 'content' table.
-- Let's create a separate NEWS table for clarity as per requirement.)

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

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;


-- 6. RLS POLICIES

-- READ: Public access for all
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public news are viewable by everyone" ON public.news FOR SELECT USING (true);

-- WRITE: Only Admins and Editors can insert/update/delete
-- Using the is_admin() function created previously or checking role directly

CREATE POLICY "Admins/Editors can manage categories" ON public.categories FOR ALL USING (
  curr_role() IN ('admin', 'editor')
);

CREATE POLICY "Admins/Editors can manage products" ON public.products FOR ALL USING (
  curr_role() IN ('admin', 'editor')
);

CREATE POLICY "Admins/Editors can manage events" ON public.events FOR ALL USING (
  curr_role() IN ('admin', 'editor')
);

CREATE POLICY "Admins/Editors can manage projects" ON public.projects FOR ALL USING (
  curr_role() IN ('admin', 'editor')
);

CREATE POLICY "Admins/Editors can manage news" ON public.news FOR ALL USING (
  curr_role() IN ('admin', 'editor')
);

-- Helper function for role check if not exists (handling both jwt claim and public.users lookup if RLS allows)
-- Assuming 'is_admin()' from previous script handles 'admin' role. 
-- We might need a broader 'is_staff()' or similar. 
-- For now, let's allow public.users check via a policy wrapper or assume the `custom_access_token` hook isn't set up yet.
-- The safest RLS for admin often looks up the user table.

-- Re-using/Polishing the helper from fix_rls.sql if needed.
-- But standard Policy for "Allow if user role is admin in public.users":
-- (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor')))

-- Let's define the policies more robustly using the subquery directly to be safe.

DROP POLICY IF EXISTS "Admins/Editors can manage categories" ON public.categories;
CREATE POLICY "Admins/Editors can manage categories" ON public.categories FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
);

DROP POLICY IF EXISTS "Admins/Editors can manage products" ON public.products;
CREATE POLICY "Admins/Editors can manage products" ON public.products FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
);

DROP POLICY IF EXISTS "Admins/Editors can manage events" ON public.events;
CREATE POLICY "Admins/Editors can manage events" ON public.events FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
);

DROP POLICY IF EXISTS "Admins/Editors can manage projects" ON public.projects;
CREATE POLICY "Admins/Editors can manage projects" ON public.projects FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
);

DROP POLICY IF EXISTS "Admins/Editors can manage news" ON public.news;
CREATE POLICY "Admins/Editors can manage news" ON public.news FOR ALL USING (
   exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'editor'))
);


-- SEED DATA (Optional - to match some frontend hardcoded data)
-- Categories
INSERT INTO public.categories (name, slug, type) VALUES 
('Công nghiệp', 'industrial', 'product'),
('Thương mại', 'commercial', 'product'),
('Dân dụng', 'residential', 'product'),
('Kho lạnh', 'cold-storage', 'product'),
('Phụ trợ', 'auxiliary', 'product');

-- Products (Sample from Products.tsx)
-- Note: IDs will be auto-generated, so we insert and let DB handle it.
-- We can script this or just have empty initial state.
