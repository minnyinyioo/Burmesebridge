alter table public.kyc_verifications
  add column if not exists didit_session_id text,
  add column if not exists didit_session_url text,
  add column if not exists didit_session_status text,
  add column if not exists didit_decision jsonb,
  add column if not exists didit_verified_at timestamptz,
  add column if not exists didit_updated_at timestamptz;

create unique index if not exists kyc_verifications_didit_session_id_idx
on public.kyc_verifications(didit_session_id)
where didit_session_id is not null;

create table if not exists public.didit_webhook_events (
  id bigserial primary key,
  event_id text not null unique,
  session_id text,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.didit_webhook_events enable row level security;

drop policy if exists "Admins read Didit webhook events" on public.didit_webhook_events;
create policy "Admins read Didit webhook events"
on public.didit_webhook_events for select to authenticated
using (public.is_admin());

drop policy if exists "No direct Didit webhook writes" on public.didit_webhook_events;
create policy "No direct Didit webhook writes"
on public.didit_webhook_events for insert to authenticated
with check (false);
