create policy "Instructors view assigned course submissions" on public.knowledge_assignment_submissions
for select to authenticated using(exists(
 select 1 from public.knowledge_assignments a join public.knowledge_lessons l on l.id=a.lesson_id
 where a.id=assignment_id and public.is_knowledge_course_instructor(l.product_id)
));

create policy "Instructors view assigned submission files" on storage.objects
for select to authenticated using(bucket_id='assignment-submissions' and exists(
 select 1 from public.knowledge_assignment_submissions s
 join public.knowledge_assignments a on a.id=s.assignment_id
 join public.knowledge_lessons l on l.id=a.lesson_id
 where s.object_path=storage.objects.name and public.is_knowledge_course_instructor(l.product_id)
));

create or replace function public.grade_knowledge_assignment_submission(p_submission_id bigint,p_score numeric,p_feedback text default null)
returns public.knowledge_assignment_submissions language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid();v_product bigint;v_max numeric;v_row public.knowledge_assignment_submissions;
begin
 select l.product_id,a.max_score into v_product,v_max from public.knowledge_assignment_submissions s join public.knowledge_assignments a on a.id=s.assignment_id join public.knowledge_lessons l on l.id=a.lesson_id where s.id=p_submission_id and s.status='submitted';
 if v_product is null then raise exception 'Submitted assignment not found';end if;
 if not public.is_knowledge_course_instructor(v_product) then raise exception 'Assigned course instructor required';end if;
 if p_score is null or p_score<0 or p_score>v_max then raise exception 'Score is outside the allowed range';end if;
 update public.knowledge_assignment_submissions set score=p_score,feedback=nullif(btrim(p_feedback),''),status='graded',graded_by=v_actor,graded_at=now(),updated_at=now() where id=p_submission_id returning * into v_row;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(v_actor,'assignment_graded','knowledge_assignment_submissions',p_submission_id::text,to_jsonb(v_row));return v_row;
end;$$;
revoke all on function public.grade_knowledge_assignment_submission(bigint,numeric,text) from public;grant execute on function public.grade_knowledge_assignment_submission(bigint,numeric,text) to authenticated;

create or replace function public.return_assignment_submission(p_submission_id bigint,p_feedback text)
returns void language plpgsql security definer set search_path=public as $$
declare v_product bigint;
begin
 select l.product_id into v_product from public.knowledge_assignment_submissions s join public.knowledge_assignments a on a.id=s.assignment_id join public.knowledge_lessons l on l.id=a.lesson_id where s.id=p_submission_id;
 if not public.is_knowledge_course_instructor(v_product) then raise exception 'Assigned course instructor required';end if;
 if nullif(btrim(p_feedback),'') is null then raise exception 'Feedback is required';end if;
 update public.knowledge_assignment_submissions set status='returned',feedback=btrim(p_feedback),score=null,graded_by=auth.uid(),graded_at=now(),updated_at=now() where id=p_submission_id and status='submitted';
 if not found then raise exception 'Submitted assignment not found';end if;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) select auth.uid(),'assignment_returned','knowledge_assignment_submissions',id::text,to_jsonb(s) from public.knowledge_assignment_submissions s where id=p_submission_id;
end;$$;
