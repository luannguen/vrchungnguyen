-- Run this in your Supabase SQL Editor to fix the "Could not find column" error

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- Storage Bucket Policy for Avatars (If not exists)
-- This assumes you have created a bucket named 'avatars' in Supabase Storage.
-- If not, please create a public bucket named 'avatars' first.

-- Enable RLS on storage.objects if not enabled (usually it is)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload avatars
-- create policy "Authenticated users can upload avatars"
-- on storage.objects for insert
-- with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow public to view avatars
-- create policy "Public Avatars are viewable"
-- on storage.objects for select
-- using ( bucket_id = 'avatars' );
