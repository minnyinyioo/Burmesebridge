alter table public.profiles add column if not exists badges text[] not null default '{}';

update public.profiles
set badges = array_remove(array[
  case when role in ('admin','moderator') then role end,
  case when verified then 'verified' end,
  case when badge in ('student','teacher','author','company','vip') then badge end
], null)
where cardinality(badges) = 0;

create or replace function public.sync_public_profile_badges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.badges := array_remove(array[
    case when new.role in ('admin','moderator') then new.role end,
    case when new.verified then 'verified' end,
    case when new.badge in ('student','teacher','author','company','vip') then new.badge end
  ] || coalesce(new.badges, '{}'), null);
  return new;
end;
$$;

drop trigger if exists profiles_sync_public_badges on public.profiles;
create trigger profiles_sync_public_badges before insert or update on public.profiles
for each row execute function public.sync_public_profile_badges();
