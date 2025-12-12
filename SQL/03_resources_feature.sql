-- Create resources table
create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  icon text not null, -- Store icon name like "LineChart", "Gauge"
  link text,
  features jsonb default '[]'::jsonb, -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.resources enable row level security;

-- Create policies
create policy "Allow public read access"
  on public.resources for select
  using (true);

create policy "Allow admin full access"
  on public.resources for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'super_admin')
    )
  );

-- Seed data
insert into public.resources (title, description, icon, link, features)
values
  (
    'Dữ liệu & Thống kê năng lượng',
    'Truy cập dữ liệu phân tích và thống kê về hiệu suất năng lượng của các hệ thống điều hòa không khí, chi phí vận hành và tác động môi trường của các công nghệ khác nhau.',
    'LineChart',
    '/data/statistics',
    '["Chỉ số hiệu suất năng lượng (EER/COP)", "Chi phí vận hành và bảo trì", "Phân tích ROI và thời gian hoàn vốn", "Dữ liệu phát thải carbon và tác động môi trường"]'::jsonb
  ),
  (
    'Công cụ tính toán & Thiết kế',
    'Sử dụng các công cụ tính toán và thiết kế để lựa chọn hệ thống điều hòa không khí phù hợp, tối ưu hóa hiệu suất và ước tính chi phí vận hành dài hạn.',
    'Gauge',
    '/data/tools',
    '["Tính toán tải lạnh cho không gian", "So sánh hiệu suất và chi phí giữa các hệ thống", "Phân tích tiết kiệm năng lượng và giảm chi phí", "Tư vấn lựa chọn giải pháp phù hợp"]'::jsonb
  );
