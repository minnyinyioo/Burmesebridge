alter table public.knowledge_memberships add column if not exists badge_type text check (badge_type in ('member','vip','premium'));

update public.knowledge_memberships m
set badge_type = coalesce(m.badge_type, p.badge_type)
from public.knowledge_membership_plans p
where m.plan_id = p.id;

create or replace function public.grant_approved_knowledge_membership()
returns trigger language plpgsql security definer set search_path=public as $$
declare plan_duration integer; existing_expiry timestamptz; has_existing boolean; member_badge text;
begin
 if new.user_id is distinct from old.user_id or new.plan_id is distinct from old.plan_id
 or new.quoted_price is distinct from old.quoted_price or new.quoted_currency is distinct from old.quoted_currency
 or new.quoted_days is distinct from old.quoted_days or new.quoted_badge is distinct from old.quoted_badge
 then raise exception 'Order identity and quoted terms cannot be changed'; end if;
 if old.status in ('approved','rejected') and new.status is distinct from old.status then raise exception 'Order already reviewed'; end if;
 if new.status='approved' and old.status='pending' then
   perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,0));
   if new.quoted_price is null then
     select duration_days, badge_type into plan_duration, member_badge from public.knowledge_membership_plans where id=new.plan_id;
   else
     plan_duration:=new.quoted_days;
     member_badge:=new.quoted_badge;
   end if;
   member_badge:=coalesce(member_badge,'vip');
   select expires_at into existing_expiry from public.knowledge_memberships where user_id=new.user_id for update;
   has_existing:=found;
   if has_existing and existing_expiry is null then raise exception 'Membership already has no expiry'; end if;
   new.reviewer_id:=auth.uid();new.reviewed_at:=now();
   insert into public.knowledge_memberships(user_id,plan_id,badge_type,starts_at,expires_at,granted_by,updated_at)
   values(new.user_id,new.plan_id,member_badge,now(),case when plan_duration is null then null else greatest(now(),coalesce(existing_expiry,now()))+make_interval(days=>plan_duration) end,auth.uid(),now())
   on conflict(user_id) do update set plan_id=excluded.plan_id,badge_type=excluded.badge_type,expires_at=excluded.expires_at,granted_by=excluded.granted_by,updated_at=now();
 elsif new.status='rejected' and old.status='pending' then new.reviewer_id:=auth.uid();new.reviewed_at:=now();
 end if;
 return new;
end $$;

create or replace function public.sync_membership_display()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='DELETE' then
   update public.public_profiles set membership_badge=null,membership_expires_at=null where id=old.user_id;
   return old;
 end if;
 update public.public_profiles set membership_badge=new.badge_type,membership_expires_at=new.expires_at where id=new.user_id;
 return new;
end $$;

create or replace function public.sync_membership_plan_badge()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.badge_type is distinct from old.badge_type then
   update public.knowledge_memberships set badge_type=new.badge_type,updated_at=now() where plan_id=new.id;
 end if;
 return new;
end $$;

drop trigger if exists sync_membership_plan_badge on public.knowledge_membership_plans;
create trigger sync_membership_plan_badge after update of badge_type on public.knowledge_membership_plans for each row execute function public.sync_membership_plan_badge();

update public.public_profiles p
set membership_badge=m.badge_type,membership_expires_at=m.expires_at
from public.knowledge_memberships m
where p.id=m.user_id;
