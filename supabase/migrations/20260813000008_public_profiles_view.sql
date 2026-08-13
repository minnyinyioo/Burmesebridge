create or replace view public.public_profiles as
select
  id,
  display_name,
  verified,
  badge,
  role
from public.profiles;

grant select on public.public_profiles to anon;
grant select on public.public_profiles to authenticated;