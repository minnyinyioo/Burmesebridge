create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  profile_name text;
  profile_avatar text;
begin
  profile_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'BurmeseBridge User'
  );
  profile_avatar := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
  );

  insert into public.profiles (
    id, email, display_name, avatar_url, role, points, badge, verified
  )
  values (
    new.id, new.email, profile_name, profile_avatar, 'user', 0, 'member', false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

update public.profiles as profile
set
  display_name = coalesce(
    nullif(trim(profile.display_name), ''),
    nullif(trim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(auth_user.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(auth_user.email, ''), '@', 1), ''),
    'BurmeseBridge User'
  ),
  avatar_url = coalesce(
    nullif(trim(profile.avatar_url), ''),
    nullif(trim(auth_user.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(auth_user.raw_user_meta_data ->> 'picture'), '')
  )
from auth.users as auth_user
where profile.id = auth_user.id
  and (
    nullif(trim(profile.display_name), '') is null
    or nullif(trim(profile.avatar_url), '') is null
  );
