alter table public.knowledge_membership_plans add column if not exists badge_type text not null default 'vip' check (badge_type in ('member','vip','premium'));
alter table public.knowledge_membership_requests
 add column if not exists quoted_price numeric(12,2),
 add column if not exists quoted_currency text,
 add column if not exists quoted_days integer,
 add column if not exists quoted_badge text;

create or replace function public.prepare_membership_order()
returns trigger language plpgsql security definer set search_path=public as $$
declare p public.knowledge_membership_plans;
begin
 select * into p from public.knowledge_membership_plans where id=new.plan_id;
 if not found or not p.enabled or p.price<=0 then raise exception 'Membership plan is unavailable'; end if;
 if not exists(select 1 from public.knowledge_payment_methods where enabled) then raise exception 'Payment methods unavailable'; end if;
 if exists(select 1 from public.knowledge_memberships where user_id=new.user_id and expires_at is null) then raise exception 'Membership has no expiry; renewal is not needed'; end if;
 new.quoted_price:=p.price; new.quoted_currency:=p.currency; new.quoted_days:=p.duration_days; new.quoted_badge:=p.badge_type;
 return new;
end $$;
create trigger prepare_membership_order before insert on public.knowledge_membership_requests for each row execute function public.prepare_membership_order();

create or replace function public.grant_approved_knowledge_membership()
returns trigger language plpgsql security definer set search_path=public as $$
declare plan_duration integer; existing_expiry timestamptz; has_existing boolean;
begin
 if new.user_id is distinct from old.user_id or new.plan_id is distinct from old.plan_id
 or new.quoted_price is distinct from old.quoted_price or new.quoted_currency is distinct from old.quoted_currency
 or new.quoted_days is distinct from old.quoted_days or new.quoted_badge is distinct from old.quoted_badge
 then raise exception 'Order identity and quoted terms cannot be changed'; end if;
 if old.status in ('approved','rejected') and new.status is distinct from old.status then raise exception 'Order already reviewed'; end if;
 if new.status='approved' and old.status='pending' then
   -- Serialize approvals for a single account; renewals preserve unexpired time.
   perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,0));
   if new.quoted_price is null then
     select duration_days into plan_duration from public.knowledge_membership_plans where id=new.plan_id;
   else plan_duration:=new.quoted_days; end if;
   select expires_at into existing_expiry from public.knowledge_memberships where user_id=new.user_id for update;
   has_existing:=found;
   if has_existing and existing_expiry is null then raise exception 'Membership already has no expiry'; end if;
   new.reviewer_id:=auth.uid();new.reviewed_at:=now();
   insert into public.knowledge_memberships(user_id,plan_id,starts_at,expires_at,granted_by,updated_at)
   values(new.user_id,new.plan_id,now(),case when plan_duration is null then null else greatest(now(),existing_expiry)+make_interval(days=>plan_duration) end,auth.uid(),now())
   on conflict(user_id) do update set plan_id=excluded.plan_id,expires_at=excluded.expires_at,granted_by=excluded.granted_by,updated_at=now();
 elsif new.status='rejected' and old.status='pending' then new.reviewer_id:=auth.uid();new.reviewed_at:=now();
 end if;
 return new;
end $$;

-- Public display metadata is separate from authorization and expires at render time.
alter table public.public_profiles add column if not exists membership_badge text;
alter table public.public_profiles add column if not exists membership_expires_at timestamptz;
create or replace function public.sync_membership_display()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='DELETE' then
   update public.public_profiles set membership_badge=null,membership_expires_at=null where id=old.user_id;
   return old;
 end if;
 update public.public_profiles set membership_badge=(select badge_type from public.knowledge_membership_plans where id=new.plan_id),membership_expires_at=new.expires_at where id=new.user_id;
 return new;
end $$;
create trigger sync_membership_display after insert or update or delete on public.knowledge_memberships for each row execute function public.sync_membership_display();
update public.public_profiles p set membership_badge=plan.badge_type,membership_expires_at=m.expires_at from public.knowledge_memberships m join public.knowledge_membership_plans plan on plan.id=m.plan_id where p.id=m.user_id;
