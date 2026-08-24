create table if not exists public.knowledge_course_instructors(
 product_id bigint not null references public.knowledge_products(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 assigned_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),primary key(product_id,user_id)
);
alter table public.knowledge_course_instructors enable row level security;
create policy "Instructors view own course assignments" on public.knowledge_course_instructors for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());
create policy "Admins manage course instructors" on public.knowledge_course_instructors for all to authenticated using(public.is_admin()) with check(public.is_admin());

create or replace function public.is_knowledge_course_instructor(p_product_id bigint) returns boolean language sql stable security definer set search_path=public as $$
 select public.is_admin_or_moderator() or exists(select 1 from public.knowledge_products p where p.id=p_product_id and p.author_id=auth.uid()) or exists(select 1 from public.knowledge_course_instructors i where i.product_id=p_product_id and i.user_id=auth.uid());
$$;
revoke all on function public.is_knowledge_course_instructor(bigint) from public;grant execute on function public.is_knowledge_course_instructor(bigint) to authenticated;

drop policy if exists "Users view own certificate requests" on public.knowledge_certificate_requests;
create policy "Users and instructors view certificate requests" on public.knowledge_certificate_requests for select to authenticated using(user_id=auth.uid() or public.is_knowledge_course_instructor(product_id));
drop policy if exists "Users view own certificates" on public.knowledge_certificates;
create policy "Users and instructors view certificates" on public.knowledge_certificates for select to authenticated using(user_id=auth.uid() or public.is_knowledge_course_instructor(product_id));

create or replace function public.assign_knowledge_course_instructor(p_product_id bigint,p_teacher_email text)
returns void language plpgsql security definer set search_path=public as $$
declare v_teacher uuid;
begin
 if not public.is_admin() then raise exception 'Administrator required';end if;
 select id into v_teacher from public.profiles where lower(email)=lower(btrim(p_teacher_email)) and verified and badge='teacher';
 if v_teacher is null then raise exception 'A verified teacher account with this email was not found';end if;
 insert into public.knowledge_course_instructors(product_id,user_id,assigned_by) values(p_product_id,v_teacher,auth.uid()) on conflict do nothing;
end;$$;
revoke all on function public.assign_knowledge_course_instructor(bigint,text) from public;grant execute on function public.assign_knowledge_course_instructor(bigint,text) to authenticated;

create or replace function public.review_knowledge_certificate_request(p_request_id bigint,p_decision text,p_review_note text default null)
returns public.knowledge_certificate_requests language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid();v_request public.knowledge_certificate_requests;v_name text;v_title text;v_certificate public.knowledge_certificates;
begin
 select r.* into v_request from public.knowledge_certificate_requests r where r.id=p_request_id for update;
 if not found or v_request.status<>'pending' then raise exception 'Pending certificate request not found';end if;
 if not public.is_knowledge_course_instructor(v_request.product_id) then raise exception 'Assigned course instructor required';end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid review decision';end if;
 if p_decision='rejected' and nullif(btrim(p_review_note),'') is null then raise exception 'A rejection reason is required';end if;
 if p_decision='approved' then
  select coalesce(nullif(trim(display_name),''),split_part(email,'@',1)) into v_name from public.profiles where id=v_request.user_id;
  select coalesce(title_en,title_zh,title_my) into v_title from public.knowledge_products where id=v_request.product_id;
  insert into public.knowledge_certificates(certificate_no,product_id,user_id,recipient_name,course_title,metadata,status,reviewed_by,review_note)
  values('BB-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),v_request.product_id,v_request.user_id,coalesce(v_name,'Learner'),v_title,v_request.eligibility_snapshot,'active',v_actor,nullif(btrim(p_review_note),''))
  on conflict(product_id,user_id) do update set status='active',revoked_at=null,revoked_by=null,revocation_reason=null,reviewed_by=v_actor,review_note=nullif(btrim(p_review_note),''),issued_at=now() returning * into v_certificate;
 end if;
 update public.knowledge_certificate_requests set status=p_decision,review_note=nullif(btrim(p_review_note),''),reviewed_by=v_actor,reviewed_at=now(),certificate_id=v_certificate.id,updated_at=now() where id=p_request_id returning * into v_request;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(v_actor,'certificate_'||p_decision,'knowledge_certificate_requests',p_request_id::text,to_jsonb(v_request));return v_request;
end;$$;
