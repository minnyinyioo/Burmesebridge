alter table public.user_notifications drop constraint if exists user_notifications_type_check;
alter table public.user_notifications add constraint user_notifications_type_check check(type in(
  'purchase_approved','purchase_rejected','report_resolved','report_rejected',
  'appeal_approved','appeal_rejected','job_reviewed','job_verified','job_returned',
  'assignment_returned','assignment_graded','system'
));

create table if not exists public.knowledge_assignment_submission_revisions(
  id bigint generated always as identity primary key,
  submission_id bigint not null references public.knowledge_assignment_submissions(id) on delete cascade,
  revision_no integer not null check(revision_no>0),
  action text not null check(action in('draft','submitted','returned','graded')),
  answer_text text,
  object_path text,
  object_mime text,
  object_size bigint,
  score numeric(7,2),
  feedback text,
  changed_by uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now(),
  unique(submission_id,revision_no)
);
alter table public.knowledge_assignment_submission_revisions enable row level security;
create policy "Users view own assignment revision history" on public.knowledge_assignment_submission_revisions
for select to authenticated using(
  public.is_admin_or_moderator() or exists(
    select 1 from public.knowledge_assignment_submissions s
    where s.id=submission_id and s.user_id=auth.uid()
  )
);

create or replace function public.record_assignment_submission_revision()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='INSERT' or row(new.answer_text,new.object_path,new.status,new.score,new.feedback)
    is distinct from row(old.answer_text,old.object_path,old.status,old.score,old.feedback) then
    insert into public.knowledge_assignment_submission_revisions(
      submission_id,revision_no,action,answer_text,object_path,object_mime,object_size,score,feedback,changed_by
    ) values(
      new.id,
      coalesce((select max(r.revision_no)+1 from public.knowledge_assignment_submission_revisions r where r.submission_id=new.id),1),
      new.status,new.answer_text,new.object_path,new.object_mime,new.object_size,new.score,new.feedback,auth.uid()
    );
  end if;
  return new;
end;$$;
drop trigger if exists record_assignment_submission_revision_trigger on public.knowledge_assignment_submissions;
create trigger record_assignment_submission_revision_trigger
after insert or update on public.knowledge_assignment_submissions
for each row execute function public.record_assignment_submission_revision();

create or replace function public.return_assignment_submission(p_submission_id bigint,p_feedback text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin_or_moderator() then raise exception 'Admin access required'; end if;
  if char_length(btrim(coalesce(p_feedback,'')))<2 then raise exception 'Return feedback is required'; end if;
  update public.knowledge_assignment_submissions
  set status='returned',feedback=left(btrim(p_feedback),2000),score=null,graded_by=null,graded_at=null,updated_at=now()
  where id=p_submission_id and status='submitted';
  if not found then raise exception 'Submission is no longer awaiting review'; end if;
end;$$;
revoke all on function public.return_assignment_submission(bigint,text) from public;
grant execute on function public.return_assignment_submission(bigint,text) to authenticated;

create or replace function public.notify_assignment_review_result()
returns trigger language plpgsql security definer set search_path=public as $$
declare product_id bigint;
begin
  if new.status in('returned','graded') and old.status is distinct from new.status then
    select l.product_id into product_id
    from public.knowledge_assignments a join public.knowledge_lessons l on l.id=a.lesson_id
    where a.id=new.assignment_id;
    insert into public.user_notifications(user_id,type,title,body,href) values(
      new.user_id,
      case when new.status='graded' then 'assignment_graded' else 'assignment_returned' end,
      case when new.status='graded' then 'Assignment graded / 作业已批改' else 'Assignment returned / 作业已退回' end,
      new.feedback,
      '/my/knowledge/'||product_id
    );
  end if;
  return new;
end;$$;
drop trigger if exists notify_assignment_review_result_trigger on public.knowledge_assignment_submissions;
create trigger notify_assignment_review_result_trigger
after update of status on public.knowledge_assignment_submissions
for each row execute function public.notify_assignment_review_result();

create index if not exists assignment_revision_submission_idx
on public.knowledge_assignment_submission_revisions(submission_id,revision_no desc);
