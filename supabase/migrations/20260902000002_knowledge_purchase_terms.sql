alter table public.knowledge_purchase_requests
  add column if not exists terms_version text,
  add column if not exists terms_consented_at timestamptz;

alter table public.knowledge_membership_requests
  add column if not exists terms_version text,
  add column if not exists terms_consented_at timestamptz;

drop policy if exists "Users can request knowledge access" on public.knowledge_purchase_requests;
create policy "Users can request knowledge access"
on public.knowledge_purchase_requests for insert to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and nullif(trim(terms_version), '') is not null
  and terms_consented_at is not null
  and terms_consented_at <= now()
);

drop policy if exists "Users create own membership requests" on public.knowledge_membership_requests;
create policy "Users create own membership requests"
on public.knowledge_membership_requests for insert to authenticated
with check (
  user_id = auth.uid()
  and status = 'pending'
  and nullif(trim(terms_version), '') is not null
  and terms_consented_at is not null
  and terms_consented_at <= now()
);

drop policy if exists "Users can retry rejected purchase requests" on public.knowledge_purchase_requests;
create policy "Users can retry rejected purchase requests"
on public.knowledge_purchase_requests for update to authenticated
using (user_id = auth.uid() and status = 'rejected')
with check (
  user_id = auth.uid()
  and status = 'pending'
  and reviewer_id is null
  and reviewed_at is null
  and nullif(trim(terms_version), '') is not null
  and terms_consented_at is not null
  and terms_consented_at <= now()
);
