alter table public.hsk_assessment_attempts
  add column if not exists display_name text,
  add column if not exists question_ids jsonb not null default '[]'::jsonb;

update public.hsk_assessment_attempts
set display_name = 'Learner'
where display_name is null or nullif(btrim(display_name), '') is null;

alter table public.hsk_assessment_attempts
  add constraint hsk_assessment_attempts_display_name_length
  check (display_name is null or char_length(display_name) between 1 and 80);

drop view if exists public.hsk_public_results;
create view public.hsk_public_results
with (security_barrier = true)
as
select report_code, display_name, estimated_level, cefr_level, score,
       correct_answers, total_questions, level_breakdown, skill_breakdown,
       created_at
from public.hsk_assessment_attempts;

revoke all on public.hsk_public_results from public;
grant select on public.hsk_public_results to anon, authenticated;

alter table public.knowledge_certificate_requests
  add column if not exists recipient_name text;

alter table public.knowledge_certificate_requests
  drop constraint if exists knowledge_certificate_requests_recipient_name_length;
alter table public.knowledge_certificate_requests
  add constraint knowledge_certificate_requests_recipient_name_length
  check (recipient_name is null or char_length(recipient_name) between 1 and 80);

drop function if exists public.request_knowledge_certificate(bigint,text);
create or replace function public.request_knowledge_certificate(
  p_product_id bigint,
  p_learner_note text default null,
  p_recipient_name text default null
)
returns public.knowledge_certificate_requests
language plpgsql security definer set search_path=public as $$
declare
  v_user uuid:=auth.uid();
  v_total int; v_done int; v_quizzes int; v_passed int;
  v_assignments int; v_graded int; v_row public.knowledge_certificate_requests;
  v_recipient text:=nullif(btrim(p_recipient_name),'');
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_recipient is not null and char_length(v_recipient)>80 then raise exception 'Certificate name is too long'; end if;
  if exists(select 1 from public.knowledge_certificates where product_id=p_product_id and user_id=v_user and status='active') then raise exception 'Certificate already issued'; end if;
  if not exists(select 1 from public.knowledge_products where id=p_product_id and status='published') then raise exception 'Course unavailable'; end if;
  select count(*),count(*) filter(where exists(select 1 from public.knowledge_lesson_progress lp where lp.lesson_id=l.id and lp.user_id=v_user and lp.completed)) into v_total,v_done from public.knowledge_lessons l where l.product_id=p_product_id and l.status='published';
  if v_total=0 or v_done<v_total then raise exception 'Complete every lesson before requesting a certificate'; end if;
  select count(*),count(*) filter(where exists(select 1 from public.knowledge_quiz_attempts qa where qa.quiz_id=q.id and qa.user_id=v_user and qa.passed)) into v_quizzes,v_passed from public.knowledge_quizzes q join public.knowledge_lessons l on l.id=q.lesson_id where l.product_id=p_product_id and q.status='published';
  if v_passed<v_quizzes then raise exception 'Pass every published quiz before requesting a certificate'; end if;
  select count(*),count(*) filter(where exists(select 1 from public.knowledge_assignment_submissions s where s.assignment_id=a.id and s.user_id=v_user and s.status='graded')) into v_assignments,v_graded from public.knowledge_assignments a join public.knowledge_lessons l on l.id=a.lesson_id where l.product_id=p_product_id and a.status='published';
  if v_graded<v_assignments then raise exception 'Every published assignment must be graded before requesting a certificate'; end if;
  if v_recipient is null then
    select coalesce(nullif(trim(display_name),''),split_part(email,'@',1)) into v_recipient from public.profiles where id=v_user;
    v_recipient:=coalesce(v_recipient,'Learner');
  end if;
  insert into public.knowledge_certificate_requests(product_id,user_id,recipient_name,learner_note,eligibility_snapshot)
  values(p_product_id,v_user,v_recipient,nullif(btrim(p_learner_note),''),jsonb_build_object('lessons_completed',v_done,'lessons_total',v_total,'quizzes_passed',v_passed,'quizzes_total',v_quizzes,'assignments_graded',v_graded,'assignments_total',v_assignments,'checked_at',now()))
  returning * into v_row;
  return v_row;
end; $$;
revoke all on function public.request_knowledge_certificate(bigint,text,text) from public;
grant execute on function public.request_knowledge_certificate(bigint,text,text) to authenticated;

create or replace function public.admin_finalize_knowledge_certificate_request(p_request_id bigint,p_decision text,p_review_note text default null)
returns public.knowledge_certificate_requests language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid();v_request public.knowledge_certificate_requests;v_name text;v_title text;v_certificate public.knowledge_certificates;
begin
 if not public.can_access_admin_portal() then raise exception 'Administrator required'; end if;
 select * into v_request from public.knowledge_certificate_requests where id=p_request_id for update;
 if not found or v_request.status<>'teacher_approved' then raise exception 'Teacher-approved request not found'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid decision'; end if;
 if p_decision='rejected' and nullif(btrim(p_review_note),'') is null then raise exception 'A rejection reason is required'; end if;
 if p_decision='approved' then
  select coalesce(nullif(trim(v_request.recipient_name),''),nullif(trim(display_name),''),split_part(email,'@',1),'Learner') into v_name from public.profiles where id=v_request.user_id;
  select coalesce(title_en,title_zh,title_my) into v_title from public.knowledge_products where id=v_request.product_id;
  insert into public.knowledge_certificates(certificate_no,product_id,user_id,recipient_name,course_title,metadata,status,reviewed_by,review_note)
  values('BB-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),v_request.product_id,v_request.user_id,v_name,v_title,v_request.eligibility_snapshot,'active',v_actor,nullif(btrim(p_review_note),''))
  on conflict(product_id,user_id) do update set status='active',revoked_at=null,revoked_by=null,revocation_reason=null,recipient_name=excluded.recipient_name,reviewed_by=v_actor,review_note=nullif(btrim(p_review_note),''),issued_at=now()
  returning * into v_certificate;
 end if;
 update public.knowledge_certificate_requests set status=p_decision,review_note=nullif(btrim(p_review_note),''),reviewed_by=v_actor,reviewed_at=now(),admin_reviewed_by=v_actor,admin_reviewed_at=now(),certificate_id=v_certificate.id,updated_at=now() where id=p_request_id returning * into v_request;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(v_actor,'certificate_admin_'||p_decision,'knowledge_certificate_requests',p_request_id::text,to_jsonb(v_request));
 return v_request;
end; $$;
