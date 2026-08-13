do $$ declare table_name text; begin
  foreach table_name in array array['profiles','news','posts','post_comments','verification_requests','knowledge_purchase_requests','content_reports','moderation_appeals'] loop
    if to_regclass('public.' || table_name) is not null then execute format('drop trigger if exists audit_admin_changes on public.%I', table_name); end if;
  end loop;
end $$;
drop function if exists public.capture_admin_audit();
drop table if exists public.admin_audit_logs;
drop table if exists public.moderation_appeals;
drop table if exists public.content_reports;
