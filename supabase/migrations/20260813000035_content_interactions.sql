create table if not exists public.content_likes (
  content_type text not null check (content_type in ('news', 'video', 'knowledge')),
  content_id bigint not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (content_type, content_id, user_id)
);

create table if not exists public.content_comments (
  id bigint generated always as identity primary key,
  content_type text not null check (content_type in ('news', 'video', 'knowledge')),
  content_id bigint not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.content_likes enable row level security;
alter table public.content_comments enable row level security;

create policy "Public reads content likes" on public.content_likes for select using (true);
create policy "Users add content likes" on public.content_likes for insert to authenticated with check (user_id = auth.uid());
create policy "Users remove own content likes" on public.content_likes for delete to authenticated using (user_id = auth.uid());
create policy "Public reads content comments" on public.content_comments for select using (true);
create policy "Users add content comments" on public.content_comments for insert to authenticated with check (user_id = auth.uid());
create policy "Users remove own content comments" on public.content_comments for delete to authenticated using (user_id = auth.uid() or public.is_admin_or_moderator());

create index if not exists content_likes_target_idx on public.content_likes(content_type, content_id);
create index if not exists content_comments_target_idx on public.content_comments(content_type, content_id, created_at);
