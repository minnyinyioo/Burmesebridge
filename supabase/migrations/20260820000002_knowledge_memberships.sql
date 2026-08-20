create table if not exists public.knowledge_membership_plans (
  id bigint generated always as identity primary key,
  code text not null unique check (code in ('monthly','yearly','lifetime')),
  duration_days integer check (duration_days is null or duration_days > 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  currency text not null default 'MMK' check (currency in ('MMK','CNY','USD')),
  enabled boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.knowledge_membership_plans(code,duration_days,sort_order)
values ('monthly',30,0),('yearly',365,1),('lifetime',null,2)
on conflict(code) do nothing;

create table if not exists public.knowledge_membership_requests (
  id bigint generated always as identity primary key,
  plan_id bigint not null references public.knowledge_membership_plans(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_reference text not null check (char_length(payment_reference) between 2 and 500),
  proof_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists knowledge_membership_one_pending_idx
on public.knowledge_membership_requests(user_id) where status='pending';

create table if not exists public.knowledge_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id bigint not null references public.knowledge_membership_plans(id),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  granted_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.knowledge_membership_plans enable row level security;
alter table public.knowledge_membership_requests enable row level security;
alter table public.knowledge_memberships enable row level security;
create policy "Users can view enabled membership plans" on public.knowledge_membership_plans for select to authenticated using(enabled or public.is_admin_or_moderator());
create policy "Editors manage membership plans" on public.knowledge_membership_plans for all to authenticated using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Users view own membership requests" on public.knowledge_membership_requests for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());
create policy "Users create own membership requests" on public.knowledge_membership_requests for insert to authenticated with check(user_id=auth.uid() and status='pending');
create policy "Editors review membership requests" on public.knowledge_membership_requests for update to authenticated using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Users view own membership" on public.knowledge_memberships for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());

create or replace function public.grant_approved_knowledge_membership()
returns trigger language plpgsql security definer set search_path=public as $$
declare plan_duration integer;
begin
  if new.status='approved' and old.status is distinct from 'approved' then
    select duration_days into plan_duration from public.knowledge_membership_plans where id=new.plan_id;
    new.reviewer_id:=auth.uid(); new.reviewed_at:=now();
    insert into public.knowledge_memberships(user_id,plan_id,starts_at,expires_at,granted_by,updated_at)
    values(new.user_id,new.plan_id,now(),case when plan_duration is null then null else now()+(plan_duration||' days')::interval end,auth.uid(),now())
    on conflict(user_id) do update set plan_id=excluded.plan_id,starts_at=excluded.starts_at,expires_at=excluded.expires_at,granted_by=excluded.granted_by,updated_at=now();
  elsif new.status='rejected' and old.status is distinct from 'rejected' then
    new.reviewer_id:=auth.uid(); new.reviewed_at:=now();
  end if;
  return new;
end; $$;
drop trigger if exists grant_approved_knowledge_membership on public.knowledge_membership_requests;
create trigger grant_approved_knowledge_membership before update on public.knowledge_membership_requests for each row execute function public.grant_approved_knowledge_membership();

drop policy if exists "Entitled users can read lesson content" on public.knowledge_lesson_content;
create policy "Entitled users can read lesson content" on public.knowledge_lesson_content for select using(
  public.is_admin_or_moderator() or exists(
    select 1 from public.knowledge_lessons lesson join public.knowledge_products product on product.id=lesson.product_id
    where lesson.id=knowledge_lesson_content.lesson_id and lesson.status='published' and product.status='published' and (
      lesson.free_preview or product.price=0
      or exists(select 1 from public.knowledge_access access where access.product_id=product.id and access.user_id=auth.uid())
      or exists(select 1 from public.knowledge_memberships member where member.user_id=auth.uid() and (member.expires_at is null or member.expires_at>now()))
    )
  )
);
drop policy if exists "Entitled users can read knowledge content" on public.knowledge_product_content;
create policy "Entitled users can read knowledge content" on public.knowledge_product_content for select using(
  public.is_admin_or_moderator()
  or exists(select 1 from public.knowledge_products product where product.id=knowledge_product_content.product_id and product.status='published' and product.price=0)
  or exists(select 1 from public.knowledge_access access where access.product_id=knowledge_product_content.product_id and access.user_id=auth.uid())
  or exists(select 1 from public.knowledge_memberships member where member.user_id=auth.uid() and (member.expires_at is null or member.expires_at>now()))
);
