-- Create team_members table
create table public.team_members (
  id uuid not null default gen_random_uuid (),
  name text not null,
  role text not null,
  bio text null,
  image_url text null,
  social_links jsonb null default '{}'::jsonb,
  display_order integer null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  constraint team_members_pkey primary key (id)
) tablespace pg_default;

-- Enable RLS
alter table public.team_members enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.team_members as permissive for select to public using (true);

create policy "Enable insert for authenticated users only" on public.team_members as permissive for insert to authenticated with check (true);

create policy "Enable update for authenticated users only" on public.team_members as permissive for update to authenticated using (true);

create policy "Enable delete for authenticated users only" on public.team_members as permissive for delete to authenticated using (true);
