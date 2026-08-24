create or replace function public.get_instructor_assignment_queue()
returns table(
 id bigint,user_id uuid,student_name text,answer_text text,object_path text,object_mime text,submitted_at timestamptz,
 max_score numeric,assignment_title text,course_title text,product_id bigint
) language sql stable security definer set search_path=public as $$
 select s.id,s.user_id,coalesce(nullif(btrim(p.display_name),''),'Learner'),s.answer_text,s.object_path,s.object_mime,s.submitted_at,
 a.max_score,coalesce(a.title_zh,a.title_my,a.title_en,'Assignment'),coalesce(k.title_zh,k.title_my,k.title_en,'Course'),k.id
 from public.knowledge_assignment_submissions s
 join public.knowledge_assignments a on a.id=s.assignment_id
 join public.knowledge_lessons l on l.id=a.lesson_id
 join public.knowledge_products k on k.id=l.product_id
 left join public.profiles p on p.id=s.user_id
 where s.status='submitted' and public.is_knowledge_course_instructor(k.id)
 order by s.submitted_at asc nulls last,s.id;
$$;
revoke all on function public.get_instructor_assignment_queue() from public;
grant execute on function public.get_instructor_assignment_queue() to authenticated;

create or replace function public.list_knowledge_course_instructors()
returns table(product_id bigint,course_title text,user_id uuid,instructor_name text,instructor_email text,created_at timestamptz)
language sql stable security definer set search_path=public as $$
 select i.product_id,coalesce(k.title_zh,k.title_my,k.title_en,'Course'),i.user_id,coalesce(nullif(btrim(p.display_name),''),'Teacher'),p.email,i.created_at
 from public.knowledge_course_instructors i join public.knowledge_products k on k.id=i.product_id join public.profiles p on p.id=i.user_id
 where public.is_admin() order by i.created_at desc;
$$;
revoke all on function public.list_knowledge_course_instructors() from public;grant execute on function public.list_knowledge_course_instructors() to authenticated;

create or replace function public.remove_knowledge_course_instructor(p_product_id bigint,p_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Administrator required';end if;delete from public.knowledge_course_instructors where product_id=p_product_id and user_id=p_user_id;end;$$;
revoke all on function public.remove_knowledge_course_instructor(bigint,uuid) from public;grant execute on function public.remove_knowledge_course_instructor(bigint,uuid) to authenticated;
