alter table public.user_notifications drop constraint if exists user_notifications_type_check;
alter table public.user_notifications add constraint user_notifications_type_check
check (type in (
  'purchase_approved','purchase_rejected','report_resolved','report_rejected',
  'appeal_approved','appeal_rejected','job_reviewed','job_verified','job_returned','system'
));

create or replace function public.notify_job_review_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  job_title text;
  notice_type text;
  notice_title text;
begin
  if new.category <> 'jobs'
    or new.author_id is null
    or new.recruitment_verification is not distinct from old.recruitment_verification then
    return new;
  end if;

  job_title := coalesce(new.title_my, new.title_zh, new.title_en, new.title, 'Job listing');
  notice_type := case new.recruitment_verification
    when 'verified' then 'job_verified'
    when 'reviewed' then 'job_reviewed'
    else 'job_returned'
  end;
  notice_title := case new.recruitment_verification
    when 'verified' then 'Job listing verified'
    when 'reviewed' then 'Job listing reviewed'
    else 'Job listing returned for review'
  end;

  insert into public.user_notifications(user_id, type, title, body, href)
  values (
    new.author_id,
    notice_type,
    notice_title,
    job_title || case
      when nullif(trim(new.recruitment_review_note), '') is not null
        then E'\n' || trim(new.recruitment_review_note)
      else ''
    end,
    '/content/' || new.id
  );
  return new;
end;
$$;

drop trigger if exists notify_job_review_result on public.news;
create trigger notify_job_review_result
after update of recruitment_verification on public.news
for each row execute function public.notify_job_review_result();
