-- Idempotent checkins RLS. Production already has SELECT/INSERT own-row policies;
-- enable RLS if needed and add the missing own-row UPDATE policy. Do not drop policies.
alter table public.checkins enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'checkins'
      and policyname = 'Users can view own checkins'
  ) then
    create policy "Users can view own checkins"
      on public.checkins
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'checkins'
      and policyname = 'Users can insert own checkins'
  ) then
    create policy "Users can insert own checkins"
      on public.checkins
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'checkins'
      and policyname = 'Users can update own checkins'
  ) then
    create policy "Users can update own checkins"
      on public.checkins
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
