create table if not exists public.post_likes (
  id bigint generated always as identity primary key,
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

create table if not exists public.post_comments (
  id bigint generated always as identity primary key,
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

create policy "Anyone can view likes"
on public.post_likes for select
using (true);

create policy "Users can like"
on public.post_likes for insert
with check (auth.uid() = user_id);

create policy "Users can unlike own like"
on public.post_likes for delete
using (auth.uid() = user_id);

create policy "Anyone can view comments"
on public.post_comments for select
using (true);

create policy "Users can comment"
on public.post_comments for insert
with check (auth.uid() = user_id);

create policy "Users can delete own comments"
on public.post_comments for delete
using (auth.uid() = user_id);