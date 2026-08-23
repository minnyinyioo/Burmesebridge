alter table public.profiles
  add column if not exists display_name_updated_at timestamptz;

create or replace function public.enforce_profile_display_name_cooldown()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if nullif(trim(new.display_name), '') is not null then
      new.display_name_updated_at := coalesce(new.display_name_updated_at, now());
    end if;
    return new;
  end if;

  if new.display_name is distinct from old.display_name then
    if auth.role() <> 'service_role'
      and old.display_name_updated_at is not null
      and old.display_name_updated_at > now() - interval '30 days' then
      raise exception using
        errcode = 'P0001',
        message = 'display_name_change_cooldown',
        detail = (old.display_name_updated_at + interval '30 days')::text;
    end if;
    new.display_name_updated_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profile_display_name_cooldown on public.profiles;
create trigger enforce_profile_display_name_cooldown
before insert or update of display_name on public.profiles
for each row execute function public.enforce_profile_display_name_cooldown();

comment on column public.profiles.display_name_updated_at is
  'Last user-visible display name change. Regular users may change the display name once every 30 days.';
