create table if not exists public.knowledge_lesson_progress (
  lesson_id bigint not null references public.knowledge_lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (lesson_id,user_id)
);
alter table public.knowledge_lesson_progress enable row level security;
create policy "Users can read own lesson progress" on public.knowledge_lesson_progress
for select to authenticated using(user_id=auth.uid());
create policy "Users can create own lesson progress" on public.knowledge_lesson_progress
for insert to authenticated with check(user_id=auth.uid());
create policy "Users can update own lesson progress" on public.knowledge_lesson_progress
for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "Users can delete own lesson progress" on public.knowledge_lesson_progress
for delete to authenticated using(user_id=auth.uid());
create index if not exists lesson_progress_user_updated_idx on public.knowledge_lesson_progress(user_id,updated_at desc);
