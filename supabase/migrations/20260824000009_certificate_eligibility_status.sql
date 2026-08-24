create or replace function public.get_knowledge_certificate_eligibility(p_product_id bigint)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare
  v_user uuid:=auth.uid();
  v_total int:=0;v_done int:=0;v_quizzes int:=0;v_passed int:=0;v_assignments int:=0;v_graded int:=0;
begin
  if v_user is null then raise exception 'Authentication required';end if;
  select count(*),count(*) filter(where exists(select 1 from public.knowledge_lesson_progress lp where lp.lesson_id=l.id and lp.user_id=v_user and lp.completed))
    into v_total,v_done from public.knowledge_lessons l where l.product_id=p_product_id and l.status='published';
  select count(*),count(*) filter(where exists(select 1 from public.knowledge_quiz_attempts qa where qa.quiz_id=q.id and qa.user_id=v_user and qa.passed))
    into v_quizzes,v_passed from public.knowledge_quizzes q join public.knowledge_lessons l on l.id=q.lesson_id where l.product_id=p_product_id and q.status='published';
  select count(*),count(*) filter(where exists(select 1 from public.knowledge_assignment_submissions s where s.assignment_id=a.id and s.user_id=v_user and s.status='graded'))
    into v_assignments,v_graded from public.knowledge_assignments a join public.knowledge_lessons l on l.id=a.lesson_id where l.product_id=p_product_id and a.status='published';
  return jsonb_build_object(
    'eligible',v_total>0 and v_done=v_total and v_passed=v_quizzes and v_graded=v_assignments,
    'lessons_completed',v_done,'lessons_total',v_total,
    'quizzes_passed',v_passed,'quizzes_total',v_quizzes,
    'assignments_graded',v_graded,'assignments_total',v_assignments
  );
end;$$;
revoke all on function public.get_knowledge_certificate_eligibility(bigint) from public;
grant execute on function public.get_knowledge_certificate_eligibility(bigint) to authenticated;
