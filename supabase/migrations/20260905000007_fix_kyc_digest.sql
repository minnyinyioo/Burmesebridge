-- Make the KYC document hash work on Supabase projects where pgcrypto
-- functions live in the extensions schema rather than public.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

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
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
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
    case when nullif(btrim(p_document_number), '') is null then null else encode(extensions.digest(upper(btrim(p_document_number)), 'sha256'), 'hex') end,
    p_document_front_path, p_document_back_path, p_consent_version, p_consented_at
  ) returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.submit_kyc_application(text,text,date,text,text,text,text,text,text,text,text,text,timestamptz) from public;
grant execute on function public.submit_kyc_application(text,text,date,text,text,text,text,text,text,text,text,text,timestamptz) to authenticated;
