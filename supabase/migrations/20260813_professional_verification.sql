create table if not exists public.verification_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  requested_badge text not null check (requested_badge in ('teacher', 'company', 'author')),
  evidence text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index if not exists verification_requests_one_pending
on public.verification_requests (user_id) where status = 'pending';

alter table public.verification_requests enable row level security;

create policy "Users can read own verification requests"
on public.verification_requests for select
using (user_id = auth.uid() or public.is_admin_or_moderator());

create policy "Users can submit verification requests"
on public.verification_requests for insert
with check (user_id = auth.uid() and status = 'pending');

create policy "Admins can review verification requests"
on public.verification_requests for update
using (public.is_admin()) with check (public.is_admin());

create or replace function public.review_verification_request(request_id bigint, decision text, note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare request_row public.verification_requests%rowtype;
begin
  if not public.is_admin() then raise exception 'Only administrators can review applications'; end if;
  if decision not in ('approved', 'rejected') then raise exception 'Invalid review decision'; end if;

  select * into request_row from public.verification_requests
  where id = request_id and status = 'pending' for update;
  if not found then raise exception 'Pending application not found'; end if;

  update public.verification_requests
  set status = decision, reviewer_id = auth.uid(), review_note = nullif(trim(note), ''), reviewed_at = now()
  where id = request_id;

  if decision = 'approved' then
    update public.profiles set badge = request_row.requested_badge, verified = true
    where id = request_row.user_id;
  end if;
end;
$$;

revoke all on function public.review_verification_request(bigint, text, text) from public;
grant execute on function public.review_verification_request(bigint, text, text) to authenticated;
