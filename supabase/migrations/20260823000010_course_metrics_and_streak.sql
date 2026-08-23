create table if not exists public.knowledge_study_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default current_date,
  watch_seconds integer not null default 0 check (watch_seconds >= 0),
  lessons_opened integer not null default 0 check (lessons_opened >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);

alter table public.knowledge_study_activity enable row level security;
drop policy if exists "Users manage own study activity" on public.knowledge_study_activity;
create policy "Users manage own study activity" on public.knowledge_study_activity
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.get_public_knowledge_course_metrics()
returns table(product_id bigint, lesson_count bigint, learner_count bigint, completion_rate integer)
language sql security definer stable set search_path=public as $$
  with published_lessons as (
    select product_id, count(*)::bigint as lesson_count
    from public.knowledge_lessons where status='published' group by product_id
  ), learners as (
    select l.product_id, p.user_id,
      count(*) filter (where p.completed)::bigint as completed_lessons
    from public.knowledge_lesson_progress p
    join public.knowledge_lessons l on l.id=p.lesson_id and l.status='published'
    group by l.product_id,p.user_id
  )
  select k.id::bigint,
    coalesce(pl.lesson_count,0)::bigint,
    count(distinct lr.user_id)::bigint,
    case when count(distinct lr.user_id)=0 or coalesce(pl.lesson_count,0)=0 then 0
      else round(100.0*count(*) filter(where lr.completed_lessons>=pl.lesson_count)/count(distinct lr.user_id))::integer end
  from public.knowledge_products k
  left join published_lessons pl on pl.product_id=k.id
  left join learners lr on lr.product_id=k.id
  where k.status='published'
  group by k.id,pl.lesson_count;
$$;
revoke all on function public.get_public_knowledge_course_metrics() from public;
grant execute on function public.get_public_knowledge_course_metrics() to anon, authenticated;

create or replace function public.save_lesson_watch_progress(p_lesson_id bigint,p_position_seconds integer,p_watch_delta integer default 0)
returns void language plpgsql security invoker set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_position_seconds<0 or p_watch_delta<0 or p_watch_delta>120 then raise exception 'Invalid progress value'; end if;
  insert into public.knowledge_lesson_progress(lesson_id,user_id,last_position_seconds,watch_seconds,last_opened_at,updated_at)
  values(p_lesson_id,auth.uid(),p_position_seconds,p_watch_delta,now(),now())
  on conflict(lesson_id,user_id) do update set last_position_seconds=excluded.last_position_seconds,watch_seconds=knowledge_lesson_progress.watch_seconds+excluded.watch_seconds,last_opened_at=now(),updated_at=now();
  insert into public.knowledge_study_activity(user_id,activity_date,watch_seconds,lessons_opened,updated_at)
  values(auth.uid(),current_date,p_watch_delta,1,now())
  on conflict(user_id,activity_date) do update set watch_seconds=knowledge_study_activity.watch_seconds+excluded.watch_seconds,lessons_opened=knowledge_study_activity.lessons_opened+1,updated_at=now();
end;$$;
revoke all on function public.save_lesson_watch_progress(bigint,integer,integer) from public;
grant execute on function public.save_lesson_watch_progress(bigint,integer,integer) to authenticated;

create or replace function public.get_my_knowledge_streak()
returns table(current_streak integer, longest_streak integer, total_study_days integer)
language sql security invoker stable set search_path=public as $$
  with days as (
    select activity_date, activity_date-row_number() over(order by activity_date)::integer as grp
    from public.knowledge_study_activity where user_id=auth.uid()
  ), runs as (
    select min(activity_date) first_day,max(activity_date) last_day,count(*)::integer length from days group by grp
  )
  select coalesce(max(length) filter(where last_day in(current_date,current_date-1)),0)::integer,
    coalesce(max(length),0)::integer,
    coalesce((select count(*) from days),0)::integer from runs;
$$;
revoke all on function public.get_my_knowledge_streak() from public;
grant execute on function public.get_my_knowledge_streak() to authenticated;
