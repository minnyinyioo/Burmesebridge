alter table public.public_profiles add column if not exists avatar_url text;
update public.public_profiles pp set avatar_url=p.avatar_url from public.profiles p where pp.id=p.id;

create or replace function public.sync_public_profile_avatar()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.public_profiles set avatar_url=new.avatar_url,updated_at=now() where id=new.id;
  if not found then
    insert into public.public_profiles(id,display_name,verified,badge,role,badges,level,avatar_url,updated_at)
    values(new.id,new.display_name,new.verified,new.badge,new.role,coalesce(new.badges,'{}'),1,new.avatar_url,now());
  end if;
  return new;
end; $$;

drop trigger if exists profiles_sync_public_avatar on public.profiles;
create trigger profiles_sync_public_avatar after insert or update of avatar_url on public.profiles for each row execute function public.sync_public_profile_avatar();
