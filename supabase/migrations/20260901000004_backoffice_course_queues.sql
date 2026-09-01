create or replace function public.get_teacher_assigned_courses()
returns table(id bigint,title_zh text,title_my text,title_en text,status text,publication_status text)
language sql stable security definer set search_path=public as $$ select p.id,p.title_zh,p.title_my,p.title_en,p.status,(select r.status from public.knowledge_course_publication_requests r where r.product_id=p.id order by r.created_at desc limit 1) from public.knowledge_products p join public.knowledge_course_instructors i on i.product_id=p.id where i.user_id=auth.uid() and public.can_access_teacher_portal() order by p.created_at desc; $$;
revoke all on function public.get_teacher_assigned_courses() from public;grant execute on function public.get_teacher_assigned_courses() to authenticated;
create or replace function public.get_admin_course_publication_queue()
returns table(id bigint,product_id bigint,requested_by uuid,request_note text,created_at timestamptz,title_zh text,title_my text,title_en text)
language sql stable security definer set search_path=public as $$ select r.id,r.product_id,r.requested_by,r.request_note,r.created_at,p.title_zh,p.title_my,p.title_en from public.knowledge_course_publication_requests r join public.knowledge_products p on p.id=r.product_id where r.status='pending' and public.can_access_admin_portal() order by r.created_at; $$;
revoke all on function public.get_admin_course_publication_queue() from public;grant execute on function public.get_admin_course_publication_queue() to authenticated;
