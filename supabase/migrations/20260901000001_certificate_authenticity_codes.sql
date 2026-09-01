alter table public.knowledge_certificates
  add column if not exists authenticity_code text;

update public.knowledge_certificates
set authenticity_code = 'BBV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20))
where authenticity_code is null;

alter table public.knowledge_certificates
  alter column authenticity_code set default ('BBV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20))),
  alter column authenticity_code set not null;

create unique index if not exists knowledge_certificates_authenticity_code_key
  on public.knowledge_certificates(authenticity_code);

create or replace function public.verify_knowledge_certificate(p_certificate_no text)
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
  select case
    when status='active' then jsonb_build_object(
      'valid',true,
      'status','active',
      'certificate_no',certificate_no,
      'authenticity_code',authenticity_code,
      'recipient_name',recipient_name,
      'course_title',course_title,
      'issued_at',issued_at
    )
    else jsonb_build_object(
      'valid',false,
      'status','revoked',
      'certificate_no',certificate_no,
      'authenticity_code',authenticity_code,
      'revoked_at',revoked_at
    )
  end
  from public.knowledge_certificates
  where certificate_no=upper(trim(p_certificate_no))
     or authenticity_code=upper(trim(p_certificate_no));
$$;

revoke all on function public.verify_knowledge_certificate(text) from public;
grant execute on function public.verify_knowledge_certificate(text) to anon,authenticated;
