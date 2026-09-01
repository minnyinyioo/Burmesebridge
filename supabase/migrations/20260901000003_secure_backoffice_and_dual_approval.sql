create table if not exists public.backoffice_staff_access(
  email text primary key check(email=lower(email) and email like '%@%'),
  access_role text not null check(access_role in ('admin','teacher')),
  enabled boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  note text check(note is null or char_length(note)<=500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.backoffice_staff_access enable row level security;
create policy "Admins manage backoffice access" on public.backoffice_staff_access for all to authenticated using(public.is_admin()) with check(public.is_admin());

insert into public.backoffice_staff_access(email,access_role,note)
select lower(email),'admin','Migrated existing administrator' from public.profiles
where role='admin' and email is not null
on conflict(email) do update set access_role='admin',enabled=true,updated_at=now();

create or replace function public.can_access_admin_portal()
returns boolean language sql stable security definer set search_path=public as $$
 select exists(
   select 1 from public.profiles p join public.backoffice_staff_access a on a.email=lower(p.email)
   where p.id=auth.uid() and p.role='admin' and a.access_role='admin' and a.enabled
     and lower(coalesce(auth.jwt()->>'email',''))=lower(p.email)
 );
$$;
revoke all on function public.can_access_admin_portal() from public;
grant execute on function public.can_access_admin_portal() to authenticated;

create or replace function public.can_access_teacher_portal()
returns boolean language sql stable security definer set search_path=public as $$
 select public.can_access_admin_portal() or exists(
   select 1 from public.profiles p
   join public.backoffice_staff_access a on a.email=lower(p.email) and a.access_role='teacher' and a.enabled
   where p.id=auth.uid() and p.verified and p.badge='teacher'
     and lower(coalesce(auth.jwt()->>'email',''))=lower(p.email)
     and exists(select 1 from public.knowledge_course_instructors i where i.user_id=p.id)
 );
$$;
revoke all on function public.can_access_teacher_portal() from public;
grant execute on function public.can_access_teacher_portal() to authenticated;

create or replace function public.is_knowledge_course_instructor(p_product_id bigint)
returns boolean language sql stable security definer set search_path=public as $$
 select public.can_access_admin_portal() or (
   public.can_access_teacher_portal() and exists(
     select 1 from public.knowledge_course_instructors i where i.product_id=p_product_id and i.user_id=auth.uid()
   )
 );
$$;

create or replace function public.has_knowledge_instructor_workspace()
returns boolean language sql stable security definer set search_path=public as $$ select public.can_access_teacher_portal(); $$;

create or replace function public.assign_knowledge_course_instructor(p_product_id bigint,p_teacher_email text)
returns void language plpgsql security definer set search_path=public as $$
declare v_teacher uuid; v_email text:=lower(btrim(p_teacher_email));
begin
 if not public.can_access_admin_portal() then raise exception 'Administrator required';end if;
 select id into v_teacher from public.profiles where lower(email)=v_email and verified and badge='teacher';
 if v_teacher is null then raise exception 'A verified teacher account with this email was not found';end if;
 insert into public.knowledge_course_instructors(product_id,user_id,assigned_by) values(p_product_id,v_teacher,auth.uid()) on conflict do nothing;
 insert into public.backoffice_staff_access(email,access_role,enabled,created_by,note)
 values(v_email,'teacher',true,auth.uid(),'Enabled by course assignment')
 on conflict(email) do update set access_role='teacher',enabled=true,updated_at=now();
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data)
 values(auth.uid(),'teacher_course_assigned','knowledge_course_instructors',p_product_id::text,jsonb_build_object('teacher_id',v_teacher,'email',v_email));
end;$$;

alter table public.knowledge_certificate_requests drop constraint if exists knowledge_certificate_requests_status_check;
alter table public.knowledge_certificate_requests add constraint knowledge_certificate_requests_status_check
 check(status in ('pending','teacher_approved','approved','rejected','cancelled'));
alter table public.knowledge_certificate_requests
 add column if not exists teacher_reviewed_by uuid references public.profiles(id) on delete set null,
 add column if not exists teacher_reviewed_at timestamptz,
 add column if not exists teacher_review_note text check(teacher_review_note is null or char_length(teacher_review_note)<=2000),
 add column if not exists admin_reviewed_by uuid references public.profiles(id) on delete set null,
 add column if not exists admin_reviewed_at timestamptz;
drop index if exists public.knowledge_certificate_request_open_guard;
create unique index knowledge_certificate_request_open_guard on public.knowledge_certificate_requests(product_id,user_id) where status in ('pending','teacher_approved');

create or replace function public.review_knowledge_certificate_request(p_request_id bigint,p_decision text,p_review_note text default null)
returns public.knowledge_certificate_requests language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid();v_request public.knowledge_certificate_requests;
begin
 select * into v_request from public.knowledge_certificate_requests where id=p_request_id for update;
 if not found or v_request.status<>'pending' then raise exception 'Pending certificate request not found';end if;
 if not public.is_knowledge_course_instructor(v_request.product_id) or public.can_access_admin_portal() then raise exception 'Assigned teacher review required';end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid review decision';end if;
 if p_decision='rejected' and nullif(btrim(p_review_note),'') is null then raise exception 'A rejection reason is required';end if;
 update public.knowledge_certificate_requests set status=case when p_decision='approved' then 'teacher_approved' else 'rejected' end,
  teacher_review_note=nullif(btrim(p_review_note),''),teacher_reviewed_by=v_actor,teacher_reviewed_at=now(),updated_at=now()
 where id=p_request_id returning * into v_request;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(v_actor,'certificate_teacher_'||p_decision,'knowledge_certificate_requests',p_request_id::text,to_jsonb(v_request));
 return v_request;
end;$$;

create or replace function public.admin_finalize_knowledge_certificate_request(p_request_id bigint,p_decision text,p_review_note text default null)
returns public.knowledge_certificate_requests language plpgsql security definer set search_path=public as $$
declare v_actor uuid:=auth.uid();v_request public.knowledge_certificate_requests;v_name text;v_title text;v_certificate public.knowledge_certificates;
begin
 if not public.can_access_admin_portal() then raise exception 'Administrator required';end if;
 select * into v_request from public.knowledge_certificate_requests where id=p_request_id for update;
 if not found or v_request.status<>'teacher_approved' then raise exception 'Teacher-approved request not found';end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid review decision';end if;
 if p_decision='rejected' and nullif(btrim(p_review_note),'') is null then raise exception 'A rejection reason is required';end if;
 if p_decision='approved' then
  select coalesce(nullif(trim(display_name),''),split_part(email,'@',1)) into v_name from public.profiles where id=v_request.user_id;
  select coalesce(title_en,title_zh,title_my) into v_title from public.knowledge_products where id=v_request.product_id;
  insert into public.knowledge_certificates(certificate_no,product_id,user_id,recipient_name,course_title,metadata,status,reviewed_by,review_note)
  values('BB-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),v_request.product_id,v_request.user_id,coalesce(v_name,'Learner'),v_title,v_request.eligibility_snapshot,'active',v_actor,nullif(btrim(p_review_note),''))
  on conflict(product_id,user_id) do update set status='active',revoked_at=null,revoked_by=null,revocation_reason=null,reviewed_by=v_actor,review_note=nullif(btrim(p_review_note),''),issued_at=now() returning * into v_certificate;
 end if;
 update public.knowledge_certificate_requests set status=p_decision,review_note=nullif(btrim(p_review_note),''),reviewed_by=v_actor,reviewed_at=now(),admin_reviewed_by=v_actor,admin_reviewed_at=now(),certificate_id=v_certificate.id,updated_at=now() where id=p_request_id returning * into v_request;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(v_actor,'certificate_admin_'||p_decision,'knowledge_certificate_requests',p_request_id::text,to_jsonb(v_request));
 return v_request;
end;$$;
revoke all on function public.admin_finalize_knowledge_certificate_request(bigint,text,text) from public;
grant execute on function public.admin_finalize_knowledge_certificate_request(bigint,text,text) to authenticated;

create table if not exists public.knowledge_course_publication_requests(
 id bigint generated always as identity primary key, product_id bigint not null references public.knowledge_products(id) on delete cascade,
 requested_by uuid not null references public.profiles(id), status text not null default 'pending' check(status in ('pending','approved','rejected','cancelled')),
 request_note text check(request_note is null or char_length(request_note)<=1000), review_note text check(review_note is null or char_length(review_note)<=2000),
 reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists knowledge_course_publication_open_guard on public.knowledge_course_publication_requests(product_id) where status='pending';
alter table public.knowledge_course_publication_requests enable row level security;
create policy "Teachers and admins view publication requests" on public.knowledge_course_publication_requests for select to authenticated using(requested_by=auth.uid() or public.can_access_admin_portal());

create or replace function public.request_course_publication(p_product_id bigint,p_note text default null)
returns public.knowledge_course_publication_requests language plpgsql security definer set search_path=public as $$
declare v_row public.knowledge_course_publication_requests;
begin
 if not public.is_knowledge_course_instructor(p_product_id) or public.can_access_admin_portal() then raise exception 'Assigned teacher required';end if;
 insert into public.knowledge_course_publication_requests(product_id,requested_by,request_note) values(p_product_id,auth.uid(),nullif(btrim(p_note),'')) returning * into v_row;
 return v_row;
end;$$;
revoke all on function public.request_course_publication(bigint,text) from public; grant execute on function public.request_course_publication(bigint,text) to authenticated;

create or replace function public.review_course_publication_request(p_request_id bigint,p_decision text,p_note text default null)
returns public.knowledge_course_publication_requests language plpgsql security definer set search_path=public as $$
declare v_row public.knowledge_course_publication_requests;
begin
 if not public.can_access_admin_portal() then raise exception 'Administrator required';end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid decision';end if;
 update public.knowledge_course_publication_requests set status=p_decision,review_note=nullif(btrim(p_note),''),reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=p_request_id and status='pending' returning * into v_row;
 if not found then raise exception 'Pending publication request not found';end if;
 if p_decision='approved' then update public.knowledge_products set status='published' where id=v_row.product_id;end if;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(auth.uid(),'course_publication_'||p_decision,'knowledge_course_publication_requests',p_request_id::text,to_jsonb(v_row));
 return v_row;
end;$$;
revoke all on function public.review_course_publication_request(bigint,text,text) from public; grant execute on function public.review_course_publication_request(bigint,text,text) to authenticated;
