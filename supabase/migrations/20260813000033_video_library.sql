create table if not exists public.videos (
  id bigint generated always as identity primary key,
  youtube_id text not null unique check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '',
  status text not null default 'published' check (status in ('draft', 'published')),
  featured boolean not null default false,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create policy "Public can read published videos" on public.videos
for select using (status = 'published' or public.is_admin_or_moderator());

create policy "Admins can create videos" on public.videos
for insert with check (public.is_admin_or_moderator());

create policy "Admins can update videos" on public.videos
for update using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());

create policy "Admins can delete videos" on public.videos
for delete using (public.is_admin_or_moderator());

create index if not exists videos_published_created_idx
on public.videos (status, featured desc, created_at desc);
