alter table public.verification_requests drop constraint if exists verification_requests_requested_badge_check;
alter table public.verification_requests add constraint verification_requests_requested_badge_check
  check (requested_badge in ('student','teacher','company','author'));

create table if not exists public.education_student_records (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  student_no text not null unique default ('BBS-' || to_char(now(),'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  status text not null default 'active' check (status in ('active','paused','completed','withdrawn')),
  admitted_at timestamptz not null default now(),
  internal_note text check (internal_note is null or char_length(internal_note) <= 2000),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.education_id_cards (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete restrict,
  card_type text not null check (card_type in ('student','teacher')),
  card_no text not null unique,
  verification_code text not null unique default ('BBID-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,24))),
  holder_name text not null,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  issued_by uuid not null references public.profiles(id) on delete restrict,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null,
  revocation_reason text check (revocation_reason is null or char_length(revocation_reason) <= 1000),
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists education_id_cards_one_active_type
  on public.education_id_cards(user_id,card_type) where status='active';
create index if not exists education_id_cards_user_idx on public.education_id_cards(user_id,issued_at desc);
create index if not exists education_student_records_status_idx on public.education_student_records(status,admitted_at desc);

alter table public.education_student_records enable row level security;
alter table public.education_id_cards enable row level security;

create policy "Students view own education record" on public.education_student_records
  for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());
create policy "Administrators manage education records" on public.education_student_records
  for all to authenticated using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Holders view own education cards" on public.education_id_cards
  for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());
create policy "Administrators manage education cards" on public.education_id_cards
  for all to authenticated using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());

create or replace function public.review_verification_request(request_id bigint, decision text, note text default null)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare request_row public.verification_requests%rowtype;clean_note text:=nullif(trim(note),'');
begin
 if not public.is_admin() then raise exception 'Only administrators can review applications';end if;
 if decision not in ('approved','rejected') then raise exception 'Invalid review decision';end if;
 if decision='rejected' and clean_note is null then raise exception 'A rejection reason is required';end if;
 select * into request_row from public.verification_requests where id=request_id and status='pending' for update;
 if not found then raise exception 'Pending application not found';end if;
 update public.verification_requests set status=decision,reviewer_id=auth.uid(),review_note=clean_note,reviewed_at=now() where id=request_id;
 if decision='approved' then
   update public.profiles set badge=request_row.requested_badge,verified=true where id=request_row.user_id;
   if request_row.requested_badge='student' then
     insert into public.education_student_records(user_id,updated_by) values(request_row.user_id,auth.uid())
     on conflict(user_id) do update set status='active',updated_at=now(),updated_by=auth.uid();
   end if;
 end if;
end;$$;
revoke all on function public.review_verification_request(bigint,text,text) from public;
grant execute on function public.review_verification_request(bigint,text,text) to authenticated;

create or replace function public.get_education_roster()
returns table(user_id uuid,display_name text,email text,badge text,verified boolean,student_no text,student_status text,admitted_at timestamptz,course_count bigint,completed_lessons bigint,card_id bigint,card_type text,card_no text,card_expires_at timestamptz)
language plpgsql stable security definer set search_path=public as $$
begin
 if not public.is_admin_or_moderator() then raise exception 'Administrator required';end if;
 return query
 select p.id,p.display_name,p.email,p.badge,p.verified,r.student_no,r.status,r.admitted_at,
   (select count(*) from public.knowledge_access a where a.user_id=p.id),
   (select count(*) from public.knowledge_lesson_progress lp where lp.user_id=p.id and lp.completed),
   c.id,c.card_type,c.card_no,c.expires_at
 from public.profiles p
 left join public.education_student_records r on r.user_id=p.id
 left join lateral (select ec.id,ec.card_type,ec.card_no,ec.expires_at from public.education_id_cards ec where ec.user_id=p.id and ec.status='active' order by ec.issued_at desc limit 1)c on true
 where p.verified=true or r.user_id is not null or exists(select 1 from public.knowledge_access a where a.user_id=p.id)
 order by coalesce(r.admitted_at,p.created_at) desc;
end;$$;
revoke all on function public.get_education_roster() from public;
grant execute on function public.get_education_roster() to authenticated;

create or replace function public.update_student_record(p_user_id uuid,p_status text,p_internal_note text default null)
returns public.education_student_records language plpgsql security definer set search_path=public as $$
declare v_row public.education_student_records;
begin
 if not public.is_admin_or_moderator() then raise exception 'Administrator required';end if;
 if p_status not in ('active','paused','completed','withdrawn') then raise exception 'Invalid student status';end if;
 insert into public.education_student_records(user_id,status,internal_note,updated_by)
 values(p_user_id,p_status,nullif(btrim(p_internal_note),''),auth.uid())
 on conflict(user_id) do update set status=excluded.status,internal_note=excluded.internal_note,updated_at=now(),updated_by=auth.uid()
 returning * into v_row;
 return v_row;
end;$$;
revoke all on function public.update_student_record(uuid,text,text) from public;
grant execute on function public.update_student_record(uuid,text,text) to authenticated;

create or replace function public.issue_education_id_card(p_user_id uuid,p_card_type text,p_valid_months integer default 12)
returns public.education_id_cards language plpgsql security definer set search_path=public as $$
declare v_profile public.profiles;v_row public.education_id_cards;v_prefix text;
begin
 if not public.is_admin() then raise exception 'Administrator required';end if;
 if p_card_type not in ('student','teacher') then raise exception 'Invalid card type';end if;
 if p_valid_months<1 or p_valid_months>36 then raise exception 'Validity must be between 1 and 36 months';end if;
 select * into v_profile from public.profiles where id=p_user_id;
 if not found or not coalesce(v_profile.verified,false) then raise exception 'Verified identity required';end if;
 if p_card_type='teacher' and v_profile.badge<>'teacher' then raise exception 'Verified teacher status required';end if;
 if p_card_type='student' then
   insert into public.education_student_records(user_id,updated_by) values(p_user_id,auth.uid())
   on conflict(user_id) do update set status='active',updated_at=now(),updated_by=auth.uid();
 end if;
 update public.education_id_cards set status='expired' where user_id=p_user_id and card_type=p_card_type and status='active' and expires_at<=now();
 if exists(select 1 from public.education_id_cards where user_id=p_user_id and card_type=p_card_type and status='active') then raise exception 'An active card of this type already exists';end if;
 v_prefix:=case when p_card_type='teacher' then 'BBT' else 'BBS' end;
 insert into public.education_id_cards(user_id,card_type,card_no,holder_name,expires_at,issued_by,metadata)
 values(p_user_id,p_card_type,v_prefix||'-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),coalesce(nullif(btrim(v_profile.display_name),''),split_part(v_profile.email,'@',1),'BurmeseBridge Member'),now()+make_interval(months=>p_valid_months),auth.uid(),jsonb_build_object('issuer','BurmeseBridge Private Learning Platform','government_credential',false))
 returning * into v_row;
 return v_row;
end;$$;
revoke all on function public.issue_education_id_card(uuid,text,integer) from public;
grant execute on function public.issue_education_id_card(uuid,text,integer) to authenticated;

create or replace function public.revoke_education_id_card(p_card_id bigint,p_reason text)
returns public.education_id_cards language plpgsql security definer set search_path=public as $$
declare v_row public.education_id_cards;
begin
 if not public.is_admin() then raise exception 'Administrator required';end if;
 if nullif(btrim(p_reason),'') is null then raise exception 'Revocation reason is required';end if;
 update public.education_id_cards set status='revoked',revoked_at=now(),revoked_by=auth.uid(),revocation_reason=btrim(p_reason) where id=p_card_id and status='active' returning * into v_row;
 if not found then raise exception 'Active card not found';end if;
 return v_row;
end;$$;
revoke all on function public.revoke_education_id_card(bigint,text) from public;
grant execute on function public.revoke_education_id_card(bigint,text) to authenticated;

create or replace function public.verify_education_id_card(p_code text)
returns jsonb language sql stable security definer set search_path=public as $$
 select case when status='active' and expires_at>now() then jsonb_build_object('valid',true,'status','active','card_type',card_type,'card_no',card_no,'verification_code',verification_code,'holder_name',holder_name,'issued_at',issued_at,'expires_at',expires_at,'issuer','BurmeseBridge Private Learning Platform','government_credential',false)
 else jsonb_build_object('valid',false,'status',case when status='active' and expires_at<=now() then 'expired' else status end,'card_type',card_type,'card_no',card_no) end
 from public.education_id_cards where card_no=upper(trim(p_code)) or verification_code=upper(trim(p_code));
$$;
revoke all on function public.verify_education_id_card(text) from public;
grant execute on function public.verify_education_id_card(text) to anon,authenticated;
