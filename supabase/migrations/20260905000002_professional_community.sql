create table if not exists public.forum_categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_my text not null,
  name_zh text not null,
  name_en text not null,
  description_my text,
  description_zh text,
  description_en text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.forum_categories (slug,name_my,name_zh,name_en,sort_order) values
  ('general','အထွေထွေ ဆွေးနွေးမှု','综合讨论','General discussion',10),
  ('chinese-learning','တရုတ်စာ လေ့လာခြင်း','中文学习','Chinese learning',20),
  ('community','အသိုင်းအဝိုင်း','社区交流','Community',30),
  ('help','အကူအညီနှင့် မေးခွန်းများ','求助与问答','Help and questions',40)
on conflict (slug) do nothing;

alter table public.posts
  add column if not exists category_id bigint references public.forum_categories(id) on delete set null,
  add column if not exists tags text[] not null default '{}',
  add column if not exists status text not null default 'published' check (status in ('pending','published','hidden')),
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_featured boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();
alter table public.posts alter column status set default 'pending';

create index if not exists posts_category_status_idx on public.posts(category_id,status,is_pinned,created_at desc);
alter table public.forum_categories enable row level security;
drop policy if exists "Anyone can view active forum categories" on public.forum_categories;
drop policy if exists "Moderators manage forum categories" on public.forum_categories;
create policy "Anyone can view active forum categories" on public.forum_categories for select using (is_active or public.is_admin_or_moderator());
create policy "Moderators manage forum categories" on public.forum_categories for all using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());

drop policy if exists "Anyone can view posts" on public.posts;
drop policy if exists "Anyone can view published posts" on public.posts;
create policy "Anyone can view published posts" on public.posts for select using (status = 'published' or user_id = auth.uid() or public.is_admin_or_moderator());
drop policy if exists "Users can create own posts" on public.posts;
create policy "Users can create own posts" on public.posts for insert with check (auth.uid() = user_id and (status = 'pending' or (status = 'published' and public.is_admin_or_moderator())));
drop policy if exists "Moderators can moderate posts" on public.posts;
create policy "Moderators can moderate posts" on public.posts for update using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());
