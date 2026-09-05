-- Self-hosted KYC workflow. This is an internal platform identity check,
-- not a government identity service or a legal compliance certification.

create extension if not exists pgcrypto;

create table if not exists public.kyc_verifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_kind text not null check (application_kind in ('student','teacher','author','company')),
  legal_name text not null check (char_length(btrim(legal_name)) between 2 and 160),
  date_of_birth date not null check (date_of_birth <= current_date and date_of_birth >= date '1900-01-01'),
  nationality text not null check (char_length(btrim(nationality)) between 2 and 80),
  country text not null check (char_length(btrim(country)) between 2 and 80),
  address text not null check (char_length(btrim(address)) between 5 and 2000),
  document_type text not null check (document_type in ('passport','national_id','driving_licence','other')),
  document_last4 text not null check (document_last4 ~ '^[A-Za-z0-9]{4,8}$'),
  document_number_hash text,
  document_front_path text,
  document_back_path text,
  status text not null default 'pending' check (status in ('pending','in_review','approved','rejected','expired')),
  consent_version text not null,
  consented_at timestamptz not null,
  retention_until timestamptz not null default (now() + interval '90 days'),
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_note text check (review_note is null or char_length(review_note) <= 2000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists kyc_verifications_one_open
on public.kyc_verifications(user_id)
where status in ('pending','in_review');

create index if not exists kyc_verifications_status_created_idx
on public.kyc_verifications(status, created_at desc);

create index if not exists kyc_verifications_user_created_idx
on public.kyc_verifications(user_id, created_at desc);

alter table public.kyc_verifications enable row level security;

drop policy if exists "Users read own KYC applications" on public.kyc_verifications;
create policy "Users read own KYC applications"
on public.kyc_verifications for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins read all KYC applications" on public.kyc_verifications;
create policy "Admins read all KYC applications"
on public.kyc_verifications for select to authenticated
using (public.is_admin());

drop policy if exists "Users cannot write KYC rows directly" on public.kyc_verifications;
create policy "Users cannot write KYC rows directly"
on public.kyc_verifications for insert to authenticated
with check (false);

drop policy if exists "Admins cannot mutate KYC rows directly" on public.kyc_verifications;
create policy "Admins cannot mutate KYC rows directly"
on public.kyc_verifications for update to authenticated
using (false) with check (false);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "KYC applicants upload own documents" on storage.objects;
create policy "KYC applicants upload own documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'kyc-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "KYC applicants and admins view documents" on storage.objects;
create policy "KYC applicants and admins view documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'kyc-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "KYC applicants delete own documents" on storage.objects;
create policy "KYC applicants delete own documents"
on storage.objects for delete to authenticated
using (
  bucket_id = 'kyc-documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

create or replace function public.submit_kyc_application(
  p_application_kind text,
  p_legal_name text,
  p_date_of_birth date,
  p_nationality text,
  p_country text,
  p_address text,
  p_document_type text,
  p_document_last4 text,
  p_document_number text,
  p_document_front_path text,
  p_document_back_path text default null,
  p_consent_version text default null,
  p_consented_at timestamptz default null
)
returns public.kyc_verifications
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_row public.kyc_verifications;
  v_user uuid := auth.uid();
  v_prefix text := v_user::text || '/';
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_application_kind not in ('student','teacher','author','company') then raise exception 'Invalid KYC application type'; end if;
  if nullif(btrim(p_legal_name), '') is null or char_length(btrim(p_legal_name)) > 160 then raise exception 'Legal name is required'; end if;
  if p_date_of_birth is null or p_date_of_birth > current_date or p_date_of_birth < date '1900-01-01' then raise exception 'Valid date of birth is required'; end if;
  if nullif(btrim(p_nationality), '') is null then raise exception 'Nationality is required'; end if;
  if nullif(btrim(p_country), '') is null then raise exception 'Country is required'; end if;
  if nullif(btrim(p_address), '') is null then raise exception 'Address is required'; end if;
  if p_document_type not in ('passport','national_id','driving_licence','other') then raise exception 'Invalid document type'; end if;
  if p_document_last4 !~ '^[A-Za-z0-9]{4,8}$' then raise exception 'Document last four characters are required'; end if;
  if p_document_front_path is null or left(p_document_front_path, length(v_prefix)) <> v_prefix then raise exception 'Document path does not belong to this account'; end if;
  if p_document_back_path is not null and left(p_document_back_path, length(v_prefix)) <> v_prefix then raise exception 'Document path does not belong to this account'; end if;
  if p_consent_version is null or p_consented_at is null or p_consented_at > now() then raise exception 'KYC consent is required'; end if;
  if exists(select 1 from public.kyc_verifications where user_id = v_user and status in ('pending','in_review')) then raise exception 'An open KYC application already exists'; end if;

  insert into public.kyc_verifications(
    user_id, application_kind, legal_name, date_of_birth, nationality, country, address,
    document_type, document_last4, document_number_hash, document_front_path,
    document_back_path, consent_version, consented_at
  ) values (
    v_user, p_application_kind, btrim(p_legal_name), p_date_of_birth, btrim(p_nationality),
    btrim(p_country), btrim(p_address), p_document_type, upper(btrim(p_document_last4)),
    case when nullif(btrim(p_document_number), '') is null then null else encode(digest(upper(btrim(p_document_number)), 'sha256'), 'hex') end,
    p_document_front_path, p_document_back_path, p_consent_version, p_consented_at
  ) returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.submit_kyc_application(text,text,date,text,text,text,text,text,text,text,text,text,timestamptz) from public;
grant execute on function public.submit_kyc_application(text,text,date,text,text,text,text,text,text,text,text,text,timestamptz) to authenticated;

create or replace function public.review_kyc_application(p_id bigint, p_decision text, p_note text default null)
returns public.kyc_verifications
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_row public.kyc_verifications;
  v_note text := nullif(btrim(p_note), '');
begin
  if not public.is_admin() then raise exception 'Only administrators can review KYC applications'; end if;
  if p_decision not in ('approved','rejected') then raise exception 'Invalid KYC decision'; end if;
  if p_decision = 'rejected' and v_note is null then raise exception 'A rejection reason is required'; end if;
  select * into v_row from public.kyc_verifications where id = p_id and status in ('pending','in_review') for update;
  if not found then raise exception 'Open KYC application not found'; end if;

  update public.kyc_verifications
  set status = p_decision, reviewer_id = auth.uid(), review_note = v_note, reviewed_at = now(), updated_at = now()
  where id = p_id
  returning * into v_row;

  if p_decision = 'approved' then
    update public.profiles
    set verified = true,
        badge = case when v_row.application_kind in ('student','teacher','author','company') then v_row.application_kind else badge end
    where id = v_row.user_id;
  end if;
  return v_row;
end;
$$;

revoke all on function public.review_kyc_application(bigint,text,text) from public;
grant execute on function public.review_kyc_application(bigint,text,text) to authenticated;

create or replace function public.clear_kyc_documents(p_id bigint)
returns public.kyc_verifications
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_row public.kyc_verifications;
begin
  if not public.is_admin() then raise exception 'Only administrators can clear KYC documents'; end if;
  update public.kyc_verifications
  set document_front_path = null, document_back_path = null, retention_until = now(), updated_at = now()
  where id = p_id
  returning * into v_row;
  if not found then raise exception 'KYC application not found'; end if;
  return v_row;
end;
$$;

revoke all on function public.clear_kyc_documents(bigint) from public;
grant execute on function public.clear_kyc_documents(bigint) to authenticated;

drop trigger if exists audit_admin_changes on public.kyc_verifications;
create trigger audit_admin_changes
after insert or update or delete on public.kyc_verifications
for each row execute function public.capture_admin_audit();
