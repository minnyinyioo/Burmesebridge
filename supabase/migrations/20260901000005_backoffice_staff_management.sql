create or replace function public.list_backoffice_staff_access()
returns table(email text,access_role text,enabled boolean,note text,created_at timestamptz,profile_id uuid,display_name text,verified boolean,badge text,course_count bigint)
language sql stable security definer set search_path=public as $$
 select a.email,a.access_role,a.enabled,a.note,a.created_at,p.id,p.display_name,p.verified,p.badge,
  (select count(*) from public.knowledge_course_instructors i where i.user_id=p.id)
 from public.backoffice_staff_access a left join public.profiles p on lower(p.email)=a.email
 where public.can_access_admin_portal() order by a.access_role,a.email;
$$;
revoke all on function public.list_backoffice_staff_access() from public;grant execute on function public.list_backoffice_staff_access() to authenticated;

create or replace function public.set_backoffice_staff_access(p_email text,p_access_role text,p_enabled boolean,p_note text default null)
returns public.backoffice_staff_access language plpgsql security definer set search_path=public as $$
declare v_email text:=lower(btrim(p_email));v_row public.backoffice_staff_access;v_profile public.profiles;
begin
 if not public.can_access_admin_portal() then raise exception 'Administrator required';end if;
 if p_access_role not in ('admin','teacher') then raise exception 'Invalid staff role';end if;
 if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Invalid email';end if;
 select * into v_profile from public.profiles where lower(email)=v_email;
 if not found then raise exception 'A registered account with this email was not found';end if;
 if p_access_role='admin' and v_profile.role<>'admin' then raise exception 'Set the account role to admin before allowlisting it';end if;
 if p_access_role='teacher' and not(v_profile.verified and v_profile.badge='teacher') then raise exception 'Teacher identity verification is required';end if;
 if v_profile.id=auth.uid() and not p_enabled then raise exception 'You cannot disable your own active administrator access';end if;
 insert into public.backoffice_staff_access(email,access_role,enabled,created_by,note,updated_at)
 values(v_email,p_access_role,p_enabled,auth.uid(),nullif(btrim(p_note),''),now())
 on conflict(email) do update set access_role=excluded.access_role,enabled=excluded.enabled,note=excluded.note,updated_at=now()
 returning * into v_row;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data)
 values(auth.uid(),case when p_enabled then 'backoffice_access_enabled' else 'backoffice_access_disabled' end,'backoffice_staff_access',v_email,to_jsonb(v_row));
 return v_row;
end;$$;
revoke all on function public.set_backoffice_staff_access(text,text,boolean,text) from public;grant execute on function public.set_backoffice_staff_access(text,text,boolean,text) to authenticated;

create or replace function public.remove_knowledge_course_instructor(p_product_id bigint,p_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_email text;
begin
 if not public.can_access_admin_portal() then raise exception 'Administrator required';end if;
 delete from public.knowledge_course_instructors where product_id=p_product_id and user_id=p_user_id;
 if not exists(select 1 from public.knowledge_course_instructors where user_id=p_user_id) then
  select lower(email) into v_email from public.profiles where id=p_user_id;
  update public.backoffice_staff_access set enabled=false,updated_at=now(),note='Automatically disabled after final course assignment was removed' where email=v_email and access_role='teacher';
 end if;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(auth.uid(),'teacher_course_unassigned','knowledge_course_instructors',p_product_id::text,jsonb_build_object('teacher_id',p_user_id));
end;$$;
