-- A profile owner may edit public profile fields, but never authorization or moderation fields.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
    or new.points is distinct from old.points
    or new.badge is distinct from old.badge
    or new.verified is distinct from old.verified
    or new.banned_until is distinct from old.banned_until
    or new.ban_reason is distinct from old.ban_reason
    or new.email is distinct from old.email
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Privileged profile fields can only be changed by an administrator'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
before update on public.profiles
for each row execute function public.protect_profile_privileged_fields();

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert to authenticated
with check (
  auth.uid() = id
  and role in ('user', 'member')
  and coalesce(points, 0) = 0
  and coalesce(verified, false) = false
  and coalesce(badge, 'member') = 'member'
  and banned_until is null
  and ban_reason is null
);
