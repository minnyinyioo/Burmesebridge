alter table public.profiles
add column if not exists verified boolean default false;

alter table public.profiles
add column if not exists badge text default 'member';

alter table public.profiles
add column if not exists avatar_url text;