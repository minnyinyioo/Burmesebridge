create or replace function public.has_knowledge_instructor_workspace()
returns boolean language sql stable security definer set search_path=public as $$
 select auth.uid() is not null and (
  public.is_admin_or_moderator()
  or exists(select 1 from public.knowledge_products where author_id=auth.uid())
  or exists(select 1 from public.knowledge_course_instructors where user_id=auth.uid())
 );
$$;
revoke all on function public.has_knowledge_instructor_workspace() from public;
grant execute on function public.has_knowledge_instructor_workspace() to authenticated;

update public.user_notifications
set href=regexp_replace(href,'^/(my|zh|en)(/|$)','/')
where href~'^/(my|zh|en)(/|$)';
