alter table public.user_notifications drop constraint if exists user_notifications_type_check;
alter table public.user_notifications add constraint user_notifications_type_check
check (type in ('purchase_approved','purchase_rejected','report_resolved','report_rejected','appeal_approved','appeal_rejected','system'));

create or replace function public.notify_moderation_result()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_table_name = 'content_reports' and new.status in ('resolved','rejected') and old.status is distinct from new.status then
    insert into public.user_notifications(user_id,type,title,body,href) values
    (new.reporter_id, case when new.status='resolved' then 'report_resolved' else 'report_rejected' end,
     case when new.status='resolved' then 'Report reviewed' else 'Report rejected' end,
     new.resolution_note, '/appeals');
  elsif tg_table_name = 'moderation_appeals' and new.status in ('approved','rejected') and old.status is distinct from new.status then
    insert into public.user_notifications(user_id,type,title,body,href) values
    (new.user_id, case when new.status='approved' then 'appeal_approved' else 'appeal_rejected' end,
     case when new.status='approved' then 'Appeal approved' else 'Appeal rejected' end,
     new.review_note, '/appeals');
  end if;
  return new;
end; $$;
drop trigger if exists notify_report_result on public.content_reports;
create trigger notify_report_result after update on public.content_reports for each row execute function public.notify_moderation_result();
drop trigger if exists notify_appeal_result on public.moderation_appeals;
create trigger notify_appeal_result after update on public.moderation_appeals for each row execute function public.notify_moderation_result();
