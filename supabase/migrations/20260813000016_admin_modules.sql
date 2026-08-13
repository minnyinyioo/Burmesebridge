-- Admin helper: check whether current user is admin or moderator.
create or replace function public.is_admin_or_moderator()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role in ('admin', 'moderator')
  );
$$;

-- Admin helper: check whether current user is admin.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- News table.
create table if not exists public.news (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  locale text default 'my',
  status text default 'published',
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.news enable row level security;

drop policy if exists "Public can read published news" on public.news;
create policy "Public can read published news"
on public.news
for select
using (
  status = 'published'
  or public.is_admin_or_moderator()
);

drop policy if exists "Admin can create news" on public.news;
create policy "Admin can create news"
on public.news
for insert
with check (public.is_admin_or_moderator());

drop policy if exists "Admin can update news" on public.news;
create policy "Admin can update news"
on public.news
for update
using (public.is_admin_or_moderator())
with check (public.is_admin_or_moderator());

drop policy if exists "Admin can delete news" on public.news;
create policy "Admin can delete news"
on public.news
for delete
using (public.is_admin_or_moderator());

-- Allow admin/moderator to read users.
drop policy if exists "Admin can read profiles" on public.profiles;
create policy "Admin can read profiles"
on public.profiles
for select
using (
  id = auth.uid()
  or public.is_admin_or_moderator()
);

-- Only admin can update user roles / ban status.
drop policy if exists "Admin can update profiles" on public.profiles;
create policy "Admin can update profiles"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

-- Admin/moderator can delete posts.
drop policy if exists "Admin can delete posts" on public.posts;
create policy "Admin can delete posts"
on public.posts
for delete
using (
  user_id = auth.uid()
  or public.is_admin_or_moderator()
);

-- Admin/moderator can delete comments.
drop policy if exists "Admin can delete comments" on public.post_comments;
create policy "Admin can delete comments"
on public.post_comments
for delete
using (
  user_id = auth.uid()
  or public.is_admin_or_moderator()
);