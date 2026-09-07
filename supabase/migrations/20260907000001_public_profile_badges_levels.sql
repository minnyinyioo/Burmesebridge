alter table public.public_profiles add column if not exists badges text[] not null default '{}';
alter table public.public_profiles add column if not exists level integer not null default 1;

create or replace function public.sync_public_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.public_profiles (id,display_name,verified,badge,role,badges,level,updated_at)
  values (new.id,new.display_name,new.verified,new.badge,new.role,coalesce(new.badges,'{}'),coalesce((select floor(sqrt(count(*)))::integer+1 from public.checkins where user_id=new.id),1),now())
  on conflict (id) do update set display_name=excluded.display_name,verified=excluded.verified,badge=excluded.badge,role=excluded.role,badges=excluded.badges,level=excluded.level,updated_at=now();
  return new;
end; $$;

create or replace function public.sync_public_profile_level()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_id uuid;
begin
  if tg_op = 'DELETE' then target_id := old.user_id; else target_id := new.user_id; end if;
  update public.public_profiles set level=greatest(1,floor(sqrt((select count(*) from public.checkins where user_id=target_id)))::integer+1),updated_at=now() where id=target_id;
  if tg_op = 'DELETE' then return old; else return new; end if;
end; $$;

drop trigger if exists checkins_sync_public_level on public.checkins;
create trigger checkins_sync_public_level after insert or update or delete on public.checkins for each row execute function public.sync_public_profile_level();

update public.public_profiles pp set badges=coalesce(p.badges,'{}'),level=greatest(1,floor(sqrt((select count(*) from public.checkins c where c.user_id=p.id)))::integer+1) from public.profiles p where pp.id=p.id;
