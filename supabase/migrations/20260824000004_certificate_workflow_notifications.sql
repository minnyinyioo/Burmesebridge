alter table public.user_notifications drop constraint if exists user_notifications_type_check;
alter table public.user_notifications add constraint user_notifications_type_check check(type in(
 'purchase_approved','purchase_rejected','report_resolved','report_rejected',
 'appeal_approved','appeal_rejected','job_reviewed','job_verified','job_returned',
 'assignment_submitted','assignment_returned','assignment_graded',
 'certificate_requested','certificate_approved','certificate_rejected','certificate_revoked','system'
));

create or replace function public.notify_certificate_request_workflow()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_title text;v_recipient uuid;
begin
 select coalesce(title_zh,title_my,title_en,'Course') into v_title from public.knowledge_products where id=new.product_id;
 if tg_op='INSERT' then
  for v_recipient in
   select distinct user_id from(
    select author_id as user_id from public.knowledge_products where id=new.product_id and author_id is not null
    union all select user_id from public.knowledge_course_instructors where product_id=new.product_id
    union all select id from public.profiles where role in('admin','moderator')
   ) recipients where user_id is not null and user_id<>new.user_id
  loop
   insert into public.user_notifications(user_id,type,title,body,href) values(v_recipient,'certificate_requested','Certificate review requested / 证书待审核',v_title,'/my/teacher');
  end loop;
 elsif new.status in('approved','rejected') and old.status is distinct from new.status then
  insert into public.user_notifications(user_id,type,title,body,href) values(new.user_id,case when new.status='approved' then 'certificate_approved' else 'certificate_rejected' end,case when new.status='approved' then 'Certificate approved / 证书已颁发' else 'Certificate review rejected / 证书申请未通过' end,v_title||case when new.review_note is not null then E'\n'||new.review_note else '' end,'/my/knowledge/'||new.product_id);
 end if;return new;
end;$$;
drop trigger if exists notify_certificate_request_workflow_trigger on public.knowledge_certificate_requests;
create trigger notify_certificate_request_workflow_trigger after insert or update of status on public.knowledge_certificate_requests for each row execute function public.notify_certificate_request_workflow();

create or replace function public.notify_certificate_revocation()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.status='revoked' and old.status is distinct from new.status then
  insert into public.user_notifications(user_id,type,title,body,href) values(new.user_id,'certificate_revoked','Certificate revoked / 证书已撤销',new.course_title||case when new.revocation_reason is not null then E'\n'||new.revocation_reason else '' end,'/my/certificate/'||new.certificate_no);
 end if;return new;
end;$$;
drop trigger if exists notify_certificate_revocation_trigger on public.knowledge_certificates;
create trigger notify_certificate_revocation_trigger after update of status on public.knowledge_certificates for each row execute function public.notify_certificate_revocation();

create or replace function public.notify_instructor_assignment_submission()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_product bigint;v_title text;v_recipient uuid;
begin
 if new.status='submitted' and (tg_op='INSERT' or old.status is distinct from new.status) then
  select l.product_id,coalesce(a.title_zh,a.title_my,a.title_en,'Assignment') into v_product,v_title from public.knowledge_assignments a join public.knowledge_lessons l on l.id=a.lesson_id where a.id=new.assignment_id;
  for v_recipient in select distinct user_id from(select author_id as user_id from public.knowledge_products where id=v_product and author_id is not null union all select user_id from public.knowledge_course_instructors where product_id=v_product) x where user_id is not null and user_id<>new.user_id loop
   insert into public.user_notifications(user_id,type,title,body,href) values(v_recipient,'assignment_submitted','Assignment submitted / 新作业待批改',v_title,'/my/teacher');
  end loop;
 end if;return new;
end;$$;
drop trigger if exists notify_instructor_assignment_submission_trigger on public.knowledge_assignment_submissions;
create trigger notify_instructor_assignment_submission_trigger after insert or update of status on public.knowledge_assignment_submissions for each row execute function public.notify_instructor_assignment_submission();
