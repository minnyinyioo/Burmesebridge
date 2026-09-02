-- A teacher identity approval must also provision the teacher portal allowlist.
-- Course-level access is still enforced by is_knowledge_course_instructor().
insert into public.backoffice_staff_access as existing(email, access_role, enabled, note)
select lower(btrim(p.email)), 'teacher', true, 'Enabled automatically after teacher verification'
from public.profiles p
where p.verified = true
  and p.badge = 'teacher'
  and p.email is not null
on conflict (email) do update
set access_role = case
    when existing.access_role = 'admin' then 'admin'
    else excluded.access_role
  end,
  enabled = true,
  note = case
    when existing.access_role = 'admin' then existing.note
    else excluded.note
  end,
  updated_at = now();

-- Verified teachers may enter the workspace before a course is assigned so they
-- can see the empty state and wait for Admin assignment. All course mutations
-- continue to require a matching knowledge_course_instructors row.
create or replace function public.can_access_teacher_portal()
returns boolean language sql stable security definer set search_path=public as $$
  select public.can_access_admin_portal() or exists(
    select 1
    from public.profiles p
    join public.backoffice_staff_access a
      on a.email = lower(p.email)
     and a.access_role = 'teacher'
     and a.enabled
    where p.id = auth.uid()
      and p.verified
      and p.badge = 'teacher'
      and lower(coalesce(auth.jwt()->>'email', '')) = lower(p.email)
  );
$$;
revoke all on function public.can_access_teacher_portal() from public;
grant execute on function public.can_access_teacher_portal() to authenticated;

-- Keep the existing approval workflow while provisioning teacher access at the
-- same transaction as the profile badge update.
create or replace function public.review_verification_request(request_id bigint, decision text, note text default null)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare
  request_row public.verification_requests%rowtype;
  clean_note text := nullif(trim(note), '');
begin
  if not public.is_admin() then
    raise exception 'Only administrators can review applications';
  end if;
  if decision not in ('approved', 'rejected') then
    raise exception 'Invalid review decision';
  end if;
  if decision = 'rejected' and clean_note is null then
    raise exception 'A rejection reason is required';
  end if;

  select * into request_row
  from public.verification_requests
  where id = request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending application not found';
  end if;

  update public.verification_requests
  set status = decision,
      reviewer_id = auth.uid(),
      review_note = clean_note,
      reviewed_at = now()
  where id = request_id;

  if decision = 'approved' then
    update public.profiles
    set badge = request_row.requested_badge,
        verified = true
    where id = request_row.user_id;

    if request_row.requested_badge = 'teacher' then
      insert into public.backoffice_staff_access as existing(email, access_role, enabled, created_by, note)
      select lower(btrim(p.email)), 'teacher', true, auth.uid(), 'Enabled automatically after teacher verification'
      from public.profiles p
      where p.id = request_row.user_id
        and p.email is not null
      on conflict (email) do update
      set access_role = case
          when existing.access_role = 'admin' then 'admin'
          else excluded.access_role
        end,
        enabled = true,
        note = case
          when existing.access_role = 'admin' then existing.note
          else excluded.note
        end,
        updated_at = now();
    end if;
  end if;
end;
$$;
revoke all on function public.review_verification_request(bigint, text, text) from public;
grant execute on function public.review_verification_request(bigint, text, text) to authenticated;
