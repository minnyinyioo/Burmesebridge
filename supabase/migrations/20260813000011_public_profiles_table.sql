drop view if exists public.public_profiles;

create table if not exists public.public_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text,
  verified boolean default false,
  badge text default 'member',
  role text default 'member',
  updated_at timestamptz default now()
);

insert into public.public_profiles (
  id,
  display_name,
  verified,
  badge,
  role
)
select
  id,
  display_name,
  verified,
  badge,
  role
from public.profiles
on conflict (id) do update
set
  display_name = excluded.display_name,
  verified = excluded.verified,
  badge = excluded.badge,
  role = excluded.role,
  updated_at = now();

alter table public.public_profiles enable row level security;

drop policy if exists "Public profiles can be read" on public.public_profiles;

create policy "Public profiles can be read"
on public.public_profiles
for select
using (true);

create or replace function public.sync_public_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.public_profiles (
    id,
    display_name,
    verified,
    badge,
    role,
    updated_at
  )
  values (
    new.id,
    new.display_name,
    new.verified,
    new.badge,
    new.role,
    now()
  )
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    verified = excluded.verified,
    badge = excluded.badge,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_public_profile_trigger on public.profiles;

create trigger sync_public_profile_trigger
after insert or update on public.profiles
for each row
execute function public.sync_public_profile();