alter table public.knowledge_certificates
  add column if not exists status text not null default 'active',
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists review_note text,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references public.profiles(id) on delete set null,
  add column if not exists revocation_reason text;

-- The legacy self-issuance RPC must not remain callable after manual review is enabled.
revoke execute on function public.issue_knowledge_certificate(bigint) from authenticated;

alter table public.knowledge_certificates drop constraint if exists knowledge_certificates_status_check;
alter table public.knowledge_certificates add constraint knowledge_certificates_status_check
  check(status in ('active','revoked'));

create table if not exists public.knowledge_certificate_requests(
  id bigint generated always as identity primary key,
  product_id bigint not null references public.knowledge_products(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check(status in ('pending','approved','rejected','cancelled')),
  learner_note text check(learner_note is null or char_length(learner_note)<=1000),
  review_note text check(review_note is null or char_length(review_note)<=2000),
  eligibility_snapshot jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  certificate_id bigint references public.knowledge_certificates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists knowledge_certificate_request_open_guard
  on public.knowledge_certificate_requests(product_id,user_id) where status='pending';
create index if not exists knowledge_certificate_request_review_idx
  on public.knowledge_certificate_requests(status,created_at,id);

alter table public.knowledge_certificate_requests enable row level security;
create policy "Users view own certificate requests" on public.knowledge_certificate_requests
  for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator() or exists(select 1 from public.knowledge_products p where p.id=product_id and p.author_id=auth.uid()));

create or replace function public.request_knowledge_certificate(p_product_id bigint,p_learner_note text default null)
returns public.knowledge_certificate_requests language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid();v_total int;v_done int;v_quizzes int;v_passed int;v_assignments int;v_graded int;v_row public.knowledge_certificate_requests;
begin
 if v_user is null then raise exception 'Authentication required';end if;
 if exists(select 1 from public.knowledge_certificates where product_id=p_product_id and user_id=v_user and status='active') then raise exception 'Certificate already issued';end if;
 if not exists(select 1 from public.knowledge_products where id=p_product_id and status='published') then raise exception 'Course unavailable';end if;
 select count(*),count(*) filter(where exists(select 1 from public.knowledge_lesson_progress lp where lp.lesson_id=l.id and lp.user_id=v_user and lp.completed)) into v_total,v_done from public.knowledge_lessons l where l.product_id=p_product_id and l.status='published';
 if v_total=0 or v_done<v_total then raise exception 'Complete every lesson before requesting a certificate';end if;
 select count(*),count(*) filter(where exists(select 1 from public.knowledge_quiz_attempts qa where qa.quiz_id=q.id and qa.user_id=v_user and qa.passed)) into v_quizzes,v_passed from public.knowledge_quizzes q join public.knowledge_lessons l on l.id=q.lesson_id where l.product_id=p_product_id and q.status='published';
 if v_passed<v_quizzes then raise exception 'Pass every published quiz before requesting a certificate';end if;
 select count(*),count(*) filter(where exists(select 1 from public.knowledge_assignment_submissions s where s.assignment_id=a.id and s.user_id=v_user and s.status='graded')) into v_assignments,v_graded from public.knowledge_assignments a join public.knowledge_lessons l on l.id=a.lesson_id where l.product_id=p_product_id and a.status='published';
 if v_graded<v_assignments then raise exception 'Every published assignment must be graded before requesting a certificate';end if;
 insert into public.knowledge_certificate_requests(product_id,user_id,learner_note,eligibility_snapshot)
 values(p_product_id,v_user,nullif(btrim(p_learner_note),''),jsonb_build_object('lessons_completed',v_done,'lessons_total',v_total,'quizzes_passed',v_passed,'quizzes_total',v_quizzes,'assignments_graded',v_graded,'assignments_total',v_assignments,'checked_at',now()))
 returning * into v_row;
 return v_row;
end;$$;
revoke all on function public.request_knowledge_certificate(bigint,text) from public;
grant execute on function public.request_knowledge_certificate(bigint,text) to authenticated;

create or replace function public.review_knowledge_certificate_request(p_request_id bigint,p_decision text,p_review_note text default null)
returns public.knowledge_certificate_requests language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid();v_request public.knowledge_certificate_requests;v_name text;v_title text;v_certificate public.knowledge_certificates;
begin
 select r.* into v_request from public.knowledge_certificate_requests r where r.id=p_request_id for update;
 if not found or v_request.status<>'pending' then raise exception 'Pending certificate request not found';end if;
 if not (public.is_admin_or_moderator() or exists(select 1 from public.knowledge_products p where p.id=v_request.product_id and p.author_id=v_actor)) then raise exception 'Course instructor or administrator required';end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid review decision';end if;
 if p_decision='rejected' and nullif(btrim(p_review_note),'') is null then raise exception 'A rejection reason is required';end if;
 if p_decision='approved' then
   select coalesce(nullif(trim(display_name),''),split_part(email,'@',1)) into v_name from public.profiles where id=v_request.user_id;
   select coalesce(title_en,title_zh,title_my) into v_title from public.knowledge_products where id=v_request.product_id;
   insert into public.knowledge_certificates(certificate_no,product_id,user_id,recipient_name,course_title,metadata,status,reviewed_by,review_note)
   values('BB-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),v_request.product_id,v_request.user_id,coalesce(v_name,'Learner'),v_title,v_request.eligibility_snapshot,'active',v_actor,nullif(btrim(p_review_note),''))
   on conflict(product_id,user_id) do update set status='active',revoked_at=null,revoked_by=null,revocation_reason=null,reviewed_by=v_actor,review_note=nullif(btrim(p_review_note),''),issued_at=now()
   returning * into v_certificate;
 end if;
 update public.knowledge_certificate_requests set status=p_decision,review_note=nullif(btrim(p_review_note),''),reviewed_by=v_actor,reviewed_at=now(),certificate_id=v_certificate.id,updated_at=now() where id=p_request_id returning * into v_request;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(v_actor,'certificate_'||p_decision,'knowledge_certificate_requests',p_request_id::text,to_jsonb(v_request));
 return v_request;
end;$$;
revoke all on function public.review_knowledge_certificate_request(bigint,text,text) from public;
grant execute on function public.review_knowledge_certificate_request(bigint,text,text) to authenticated;

create or replace function public.revoke_knowledge_certificate(p_certificate_id bigint,p_reason text)
returns public.knowledge_certificates language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid();v_row public.knowledge_certificates;
begin
 if not public.is_admin_or_moderator() then raise exception 'Administrator required';end if;
 if nullif(btrim(p_reason),'') is null then raise exception 'Revocation reason is required';end if;
 update public.knowledge_certificates set status='revoked',revoked_at=now(),revoked_by=v_actor,revocation_reason=btrim(p_reason) where id=p_certificate_id and status='active' returning * into v_row;
 if not found then raise exception 'Active certificate not found';end if;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(v_actor,'certificate_revoked','knowledge_certificates',p_certificate_id::text,to_jsonb(v_row));
 return v_row;
end;$$;
revoke all on function public.revoke_knowledge_certificate(bigint,text) from public;
grant execute on function public.revoke_knowledge_certificate(bigint,text) to authenticated;

create or replace function public.verify_knowledge_certificate(p_certificate_no text) returns jsonb language sql stable security definer set search_path=public as $$
 select case when status='active' then jsonb_build_object('valid',true,'status','active','certificate_no',certificate_no,'recipient_name',recipient_name,'course_title',course_title,'issued_at',issued_at)
 else jsonb_build_object('valid',false,'status','revoked','certificate_no',certificate_no,'revoked_at',revoked_at) end
 from public.knowledge_certificates where certificate_no=upper(trim(p_certificate_no));
$$;
revoke all on function public.verify_knowledge_certificate(text) from public;
grant execute on function public.verify_knowledge_certificate(text) to anon,authenticated;
