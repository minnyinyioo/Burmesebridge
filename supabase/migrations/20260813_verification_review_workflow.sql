drop policy if exists "Users can submit verification requests" on public.verification_requests;

create policy "Users can submit verification requests"
on public.verification_requests for insert
with check (
  user_id = auth.uid()
  and status = 'pending'
  and reviewer_id is null
  and review_note is null
  and reviewed_at is null
  and not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.verified = true
  )
);

create or replace function public.review_verification_request(request_id bigint, decision text, note text default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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
    set badge = request_row.requested_badge, verified = true
    where id = request_row.user_id;
  end if;
end;
$$;

revoke all on function public.review_verification_request(bigint, text, text) from public;
grant execute on function public.review_verification_request(bigint, text, text) to authenticated;
