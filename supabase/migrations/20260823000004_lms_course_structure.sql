-- Product-grade LMS structure built on the existing knowledge system.
-- Existing products, lessons, access rules and attachments remain compatible.

create table if not exists public.knowledge_course_sections (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.knowledge_products(id) on delete cascade,
  title_my text,
  title_zh text,
  title_en text,
  description_my text,
  description_zh text,
  description_en text,
  position integer not null default 0 check (position >= 0),
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(title_my,title_zh,title_en,'') <> '')
);

alter table public.knowledge_lessons
  add column if not exists section_id bigint references public.knowledge_course_sections(id) on delete set null,
  add column if not exists duration_seconds integer not null default 0 check (duration_seconds >= 0);

alter table public.knowledge_products
  add column if not exists level text,
  add column if not exists skill text,
  add column if not exists teacher_name text,
  add column if not exists teacher_bio text,
  add column if not exists learning_objectives jsonb not null default '[]'::jsonb,
  add column if not exists target_audience jsonb not null default '[]'::jsonb,
  add column if not exists estimated_minutes integer not null default 0 check (estimated_minutes >= 0);

alter table public.knowledge_lesson_content
  add column if not exists captions jsonb not null default '[]'::jsonb,
  add column if not exists vocabulary jsonb not null default '[]'::jsonb,
  add column if not exists handout_my text,
  add column if not exists handout_zh text,
  add column if not exists handout_en text;

alter table public.knowledge_lesson_progress
  add column if not exists last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  add column if not exists watch_seconds integer not null default 0 check (watch_seconds >= 0),
  add column if not exists last_opened_at timestamptz not null default now();

create table if not exists public.knowledge_resource_licenses (
  id bigint generated always as identity primary key,
  product_id bigint references public.knowledge_products(id) on delete cascade,
  lesson_id bigint references public.knowledge_lessons(id) on delete cascade,
  resource_type text not null check (resource_type in ('video','audio','image','text','subtitle','attachment','dataset','other')),
  title text not null check (char_length(title) between 1 and 300),
  source_url text not null check (source_url ~ '^https://'),
  author_name text,
  license_code text not null,
  license_url text check (license_url is null or license_url ~ '^https://'),
  attribution_text text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check (product_id is not null or lesson_id is not null)
);

create table if not exists public.knowledge_assignments (
  id bigint generated always as identity primary key,
  lesson_id bigint not null references public.knowledge_lessons(id) on delete cascade,
  title_my text,
  title_zh text,
  title_en text,
  instructions_my text,
  instructions_zh text,
  instructions_en text,
  max_score numeric(7,2) not null default 100 check (max_score > 0),
  due_days integer check (due_days is null or due_days >= 0),
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(title_my,title_zh,title_en,'') <> '')
);

create table if not exists public.knowledge_assignment_submissions (
  id bigint generated always as identity primary key,
  assignment_id bigint not null references public.knowledge_assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answer_text text,
  object_path text,
  status text not null default 'submitted' check (status in ('draft','submitted','graded','returned')),
  score numeric(7,2),
  feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id,user_id),
  check (answer_text is not null or object_path is not null),
  check (score is null or score >= 0)
);

alter table public.knowledge_course_sections enable row level security;
alter table public.knowledge_resource_licenses enable row level security;
alter table public.knowledge_assignments enable row level security;
alter table public.knowledge_assignment_submissions enable row level security;

create policy "Public can view published course sections" on public.knowledge_course_sections
for select using (
  public.is_admin_or_moderator()
  or (status='published' and exists(select 1 from public.knowledge_products p where p.id=product_id and p.status='published'))
);
create policy "Editors can create course sections" on public.knowledge_course_sections for insert with check(public.is_admin_or_moderator());
create policy "Editors can update course sections" on public.knowledge_course_sections for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors can delete course sections" on public.knowledge_course_sections for delete using(public.is_admin_or_moderator());

create policy "Public can view resource licenses" on public.knowledge_resource_licenses for select using(true);
create policy "Editors can create resource licenses" on public.knowledge_resource_licenses for insert with check(public.is_admin_or_moderator());
create policy "Editors can update resource licenses" on public.knowledge_resource_licenses for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors can delete resource licenses" on public.knowledge_resource_licenses for delete using(public.is_admin_or_moderator());

create policy "Learners can view accessible assignments" on public.knowledge_assignments
for select using (
  public.is_admin_or_moderator()
  or (status='published' and exists (
    select 1 from public.knowledge_lessons lesson
    join public.knowledge_products product on product.id=lesson.product_id
    where lesson.id=lesson_id and lesson.status='published' and product.status='published'
      and (lesson.free_preview or product.price=0
        or exists(select 1 from public.knowledge_access access where access.product_id=product.id and access.user_id=auth.uid())
        or exists(select 1 from public.knowledge_memberships membership where membership.user_id=auth.uid() and (membership.expires_at is null or membership.expires_at>now())))
  ))
);
create policy "Editors can create assignments" on public.knowledge_assignments for insert with check(public.is_admin_or_moderator());
create policy "Editors can update assignments" on public.knowledge_assignments for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors can delete assignments" on public.knowledge_assignments for delete using(public.is_admin_or_moderator());

create policy "Users can view own submissions" on public.knowledge_assignment_submissions
for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());
create policy "Users can create own submissions" on public.knowledge_assignment_submissions
for insert to authenticated with check(user_id=auth.uid() and status in ('draft','submitted') and score is null and feedback is null and graded_by is null);
create policy "Users can update ungraded own submissions" on public.knowledge_assignment_submissions
for update to authenticated using(user_id=auth.uid() and status in ('draft','submitted','returned'))
with check(user_id=auth.uid() and status in ('draft','submitted') and score is null and feedback is null and graded_by is null);
create policy "Editors can grade submissions" on public.knowledge_assignment_submissions
for update to authenticated using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());

create index if not exists knowledge_sections_product_position_idx on public.knowledge_course_sections(product_id,position,id);
create index if not exists knowledge_lessons_section_position_idx on public.knowledge_lessons(section_id,position,id);
create index if not exists knowledge_licenses_product_idx on public.knowledge_resource_licenses(product_id,lesson_id);
create index if not exists knowledge_assignments_lesson_idx on public.knowledge_assignments(lesson_id,status,id);
create index if not exists knowledge_submissions_grading_idx on public.knowledge_assignment_submissions(status,submitted_at,id);

