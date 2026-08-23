create or replace function public.save_lesson_watch_progress(p_lesson_id bigint,p_position_seconds integer,p_watch_delta integer default 0)
returns void language plpgsql security invoker set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_position_seconds<0 or p_watch_delta<0 or p_watch_delta>120 then raise exception 'Invalid progress value'; end if;
  insert into public.knowledge_lesson_progress(lesson_id,user_id,last_position_seconds,watch_seconds,last_opened_at,updated_at)
  values(p_lesson_id,auth.uid(),p_position_seconds,p_watch_delta,now(),now())
  on conflict(lesson_id,user_id) do update set last_position_seconds=excluded.last_position_seconds,watch_seconds=knowledge_lesson_progress.watch_seconds+excluded.watch_seconds,last_opened_at=now(),updated_at=now();
end;$$;
revoke all on function public.save_lesson_watch_progress(bigint,integer,integer) from public;
grant execute on function public.save_lesson_watch_progress(bigint,integer,integer) to authenticated;

