-- Database-enforced abuse controls. These triggers apply even when callers
-- bypass the UI and write through the public Supabase API directly.
create or replace function public.enforce_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  recent_count integer;
  maximum_count integer := tg_argv[1]::integer;
  time_window interval := tg_argv[2]::interval;
begin
  actor_id := nullif(to_jsonb(new) ->> tg_argv[0], '')::uuid;
  if actor_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(tg_table_schema || '.' || tg_table_name || ':' || actor_id::text, 0));
  execute format(
    'select count(*) from %I.%I where %I = $1 and created_at >= now() - $2',
    tg_table_schema, tg_table_name, tg_argv[0]
  ) into recent_count using actor_id, time_window;

  if recent_count >= maximum_count then
    raise exception 'Submission rate limit exceeded. Please try again later.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_submission_rate_limit() from public;

drop trigger if exists rate_limit_posts on public.posts;
create trigger rate_limit_posts before insert on public.posts for each row
execute function public.enforce_submission_rate_limit('user_id', '5', '10 minutes');

drop trigger if exists rate_limit_post_comments on public.post_comments;
create trigger rate_limit_post_comments before insert on public.post_comments for each row
execute function public.enforce_submission_rate_limit('user_id', '20', '10 minutes');

drop trigger if exists rate_limit_content_comments on public.content_comments;
create trigger rate_limit_content_comments before insert on public.content_comments for each row
execute function public.enforce_submission_rate_limit('user_id', '20', '10 minutes');

drop trigger if exists rate_limit_feedback on public.feedback_reports;
create trigger rate_limit_feedback before insert on public.feedback_reports for each row
execute function public.enforce_submission_rate_limit('user_id', '3', '1 hour');

drop trigger if exists rate_limit_reports on public.content_reports;
create trigger rate_limit_reports before insert on public.content_reports for each row
execute function public.enforce_submission_rate_limit('reporter_id', '10', '1 hour');

drop trigger if exists rate_limit_appeals on public.moderation_appeals;
create trigger rate_limit_appeals before insert on public.moderation_appeals for each row
execute function public.enforce_submission_rate_limit('user_id', '3', '1 day');

