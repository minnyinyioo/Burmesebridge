create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.posts enable row level security;

drop policy if exists "Anyone can view posts" on public.posts;
drop policy if exists "Users can create own posts" on public.posts;
drop policy if exists "Users can delete own posts" on public.posts;

create policy "Anyone can view posts"
on public.posts
for select
using (true);

create policy "Users can create own posts"
on public.posts
for insert
with check (auth.uid() = user_id);

create policy "Users can delete own posts"
on public.posts
for delete
using (auth.uid() = user_id);