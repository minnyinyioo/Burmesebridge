alter table public.knowledge_lesson_content
  add column if not exists mux_asset_id text,
  add column if not exists mux_upload_id text,
  add column if not exists mux_playback_id text,
  add column if not exists mux_status text not null default 'none'
    check (mux_status in ('none','waiting','preparing','ready','errored'));

create index if not exists knowledge_lesson_content_mux_asset_idx
  on public.knowledge_lesson_content(mux_asset_id);

create table if not exists public.knowledge_lesson_progress (
  lesson_id bigint not null references public.knowledge_lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (lesson_id, user_id)
);

alter table public.knowledge_lesson_progress enable row level security;
drop policy if exists "Users can view own lesson progress" on public.knowledge_lesson_progress;
drop policy if exists "Users can write own lesson progress" on public.knowledge_lesson_progress;
drop policy if exists "Users can update own lesson progress" on public.knowledge_lesson_progress;
create policy "Users can view own lesson progress" on public.knowledge_lesson_progress
  for select using (user_id = auth.uid() or public.is_admin_or_moderator());
create policy "Users can write own lesson progress" on public.knowledge_lesson_progress
  for insert with check (user_id = auth.uid());
create policy "Users can update own lesson progress" on public.knowledge_lesson_progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
