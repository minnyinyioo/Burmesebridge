create table if not exists public.knowledge_lessons (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.knowledge_products(id) on delete cascade,
  title_my text,
  title_zh text,
  title_en text,
  position integer not null default 0 check (position >= 0),
  free_preview boolean not null default false,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(title_my,title_zh,title_en,'') <> '')
);
create table if not exists public.knowledge_lesson_content (
  lesson_id bigint primary key references public.knowledge_lessons(id) on delete cascade,
  body_my text,
  body_zh text,
  body_en text,
  youtube_id text check (youtube_id is null or youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  updated_at timestamptz not null default now()
);
alter table public.knowledge_lessons enable row level security;
alter table public.knowledge_lesson_content enable row level security;

create policy "Public can view published lesson catalogue" on public.knowledge_lessons
for select using (
  public.is_admin_or_moderator()
  or (status='published' and exists(select 1 from public.knowledge_products p where p.id=product_id and p.status='published'))
);
create policy "Editors can create lessons" on public.knowledge_lessons for insert with check(public.is_admin_or_moderator());
create policy "Editors can update lessons" on public.knowledge_lessons for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors can delete lessons" on public.knowledge_lessons for delete using(public.is_admin_or_moderator());

create policy "Entitled users can read lesson content" on public.knowledge_lesson_content
for select using (
  public.is_admin_or_moderator()
  or exists (
    select 1 from public.knowledge_lessons lesson
    join public.knowledge_products product on product.id=lesson.product_id
    where lesson.id=public.knowledge_lesson_content.lesson_id
      and lesson.status='published' and product.status='published'
      and (
        lesson.free_preview or product.price=0
        or exists(select 1 from public.knowledge_access access where access.product_id=product.id and access.user_id=auth.uid())
      )
  )
);
create policy "Editors can create lesson content" on public.knowledge_lesson_content for insert with check(public.is_admin_or_moderator());
create policy "Editors can update lesson content" on public.knowledge_lesson_content for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors can delete lesson content" on public.knowledge_lesson_content for delete using(public.is_admin_or_moderator());
create index if not exists knowledge_lessons_product_position_idx on public.knowledge_lessons(product_id,position,id);
