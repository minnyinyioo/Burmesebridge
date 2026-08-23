create or replace function public.validate_assignment_grade()
returns trigger language plpgsql set search_path=public as $$
declare maximum numeric;
begin
  if new.score is null then return new; end if;
  select max_score into maximum from public.knowledge_assignments where id=new.assignment_id;
  if maximum is null or new.score < 0 or new.score > maximum then
    raise exception 'Assignment score must be between 0 and the assignment maximum';
  end if;
  if new.status='graded' and (new.graded_by is null or new.graded_at is null) then
    raise exception 'A graded submission requires grader and grading time';
  end if;
  return new;
end;$$;

drop trigger if exists validate_assignment_grade_trigger on public.knowledge_assignment_submissions;
create trigger validate_assignment_grade_trigger
before insert or update of score,status,graded_by,graded_at on public.knowledge_assignment_submissions
for each row execute function public.validate_assignment_grade();
