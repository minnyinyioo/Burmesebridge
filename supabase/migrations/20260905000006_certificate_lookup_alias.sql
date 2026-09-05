create or replace function public.verify_knowledge_certificate(p_certificate_no text)
returns jsonb language sql stable security definer set search_path=public as $$
 select case when status='active' then jsonb_build_object('valid',true,'status','active','certificate_no',certificate_no,'authenticity_code',authenticity_code,'recipient_name',recipient_name,'course_title',course_title,'issued_at',issued_at)
 else jsonb_build_object('valid',false,'status','revoked','certificate_no',certificate_no,'authenticity_code',authenticity_code,'revoked_at',revoked_at) end
 from public.knowledge_certificates
 where upper(trim(p_certificate_no)) in (upper(certificate_no),upper(authenticity_code));
$$;
revoke all on function public.verify_knowledge_certificate(text) from public;
grant execute on function public.verify_knowledge_certificate(text) to anon,authenticated;
