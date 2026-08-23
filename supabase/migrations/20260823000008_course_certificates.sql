create table if not exists public.knowledge_certificates(
 id bigint generated always as identity primary key,certificate_no text not null unique,product_id bigint not null references public.knowledge_products(id) on delete restrict,
 user_id uuid not null references auth.users(id) on delete restrict,recipient_name text not null,course_title text not null,issued_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb,unique(product_id,user_id)
);
alter table public.knowledge_certificates enable row level security;
create policy "Users view own certificates" on public.knowledge_certificates for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());

create or replace function public.issue_knowledge_certificate(p_product_id bigint)
returns public.knowledge_certificates language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid();v_name text;v_title text;v_row public.knowledge_certificates;v_total integer;v_done integer;
begin
 if v_user is null then raise exception 'Authentication required';end if;
 select count(*) into v_total from public.knowledge_lessons where product_id=p_product_id and status='published';
 select count(*) into v_done from public.knowledge_lessons l where l.product_id=p_product_id and l.status='published' and exists(select 1 from public.knowledge_lesson_progress p where p.lesson_id=l.id and p.user_id=v_user and p.completed);
 if v_total=0 or v_done<v_total then raise exception 'Complete every lesson before requesting a certificate';end if;
 if exists(select 1 from public.knowledge_quizzes q join public.knowledge_lessons l on l.id=q.lesson_id where l.product_id=p_product_id and q.status='published' and not exists(select 1 from public.knowledge_quiz_attempts a where a.quiz_id=q.id and a.user_id=v_user and a.passed)) then raise exception 'Pass every published quiz before requesting a certificate';end if;
 select coalesce(nullif(trim(display_name),''),split_part(email,'@',1)) into v_name from public.profiles where id=v_user;
 select coalesce(title_en,title_zh,title_my) into v_title from public.knowledge_products where id=p_product_id and status='published';if v_title is null then raise exception 'Course unavailable';end if;
 insert into public.knowledge_certificates(certificate_no,product_id,user_id,recipient_name,course_title,metadata)
 values('BB-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),p_product_id,v_user,coalesce(v_name,'Learner'),v_title,jsonb_build_object('lessons',v_total))
 on conflict(product_id,user_id) do update set product_id=excluded.product_id returning * into v_row;return v_row;
end;$$;
revoke all on function public.issue_knowledge_certificate(bigint) from public;grant execute on function public.issue_knowledge_certificate(bigint) to authenticated;

create or replace function public.verify_knowledge_certificate(p_certificate_no text) returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('valid',true,'certificate_no',certificate_no,'recipient_name',recipient_name,'course_title',course_title,'issued_at',issued_at) from public.knowledge_certificates where certificate_no=upper(trim(p_certificate_no));
$$;
revoke all on function public.verify_knowledge_certificate(text) from public;grant execute on function public.verify_knowledge_certificate(text) to anon,authenticated;
create index if not exists knowledge_certificates_user_idx on public.knowledge_certificates(user_id,issued_at desc);

