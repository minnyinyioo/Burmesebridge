create table if not exists public.knowledge_quizzes(
 id bigint generated always as identity primary key,lesson_id bigint not null references public.knowledge_lessons(id) on delete cascade,
 title_my text,title_zh text,title_en text,passing_score numeric(5,2) not null default 60 check(passing_score between 0 and 100),
 status text not null default 'draft' check(status in('draft','published')),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(coalesce(title_my,title_zh,title_en,'')<>'')
);
create table if not exists public.knowledge_quiz_questions(
 id bigint generated always as identity primary key,quiz_id bigint not null references public.knowledge_quizzes(id) on delete cascade,
 question_type text not null check(question_type in('single','multiple','listening','ordering','fill','writing')),
 prompt_my text,prompt_zh text,prompt_en text,options jsonb not null default '[]'::jsonb,audio_url text check(audio_url is null or audio_url~'^https://'),
 position integer not null default 0 check(position>=0),points numeric(7,2) not null default 1 check(points>0),created_at timestamptz not null default now(),
 check(coalesce(prompt_my,prompt_zh,prompt_en,'')<>'')
);
create table if not exists public.knowledge_quiz_answer_keys(
 question_id bigint primary key references public.knowledge_quiz_questions(id) on delete cascade,correct_answer jsonb not null,explanation_my text,explanation_zh text,explanation_en text
);
create table if not exists public.knowledge_quiz_attempts(
 id bigint generated always as identity primary key,quiz_id bigint not null references public.knowledge_quizzes(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
 answers jsonb not null default '{}'::jsonb,score numeric(7,2) not null,max_score numeric(7,2) not null,percentage numeric(5,2) not null,passed boolean not null,
 created_at timestamptz not null default now()
);
alter table public.knowledge_quizzes enable row level security;alter table public.knowledge_quiz_questions enable row level security;alter table public.knowledge_quiz_answer_keys enable row level security;alter table public.knowledge_quiz_attempts enable row level security;
create or replace function public.can_access_knowledge_lesson(p_lesson_id bigint) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.knowledge_lessons l join public.knowledge_products p on p.id=l.product_id where l.id=p_lesson_id and l.status='published' and p.status='published' and (l.free_preview or p.price=0 or public.is_admin_or_moderator() or exists(select 1 from public.knowledge_access a where a.product_id=p.id and a.user_id=auth.uid()) or exists(select 1 from public.knowledge_memberships m where m.user_id=auth.uid() and (m.expires_at is null or m.expires_at>now()))));
$$;
create policy "Learners can view published quizzes" on public.knowledge_quizzes for select using(public.is_admin_or_moderator() or (status='published' and public.can_access_knowledge_lesson(lesson_id)));
create policy "Editors manage quizzes insert" on public.knowledge_quizzes for insert with check(public.is_admin_or_moderator());
create policy "Editors manage quizzes update" on public.knowledge_quizzes for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors manage quizzes delete" on public.knowledge_quizzes for delete using(public.is_admin_or_moderator());
create policy "Learners can view published quiz questions" on public.knowledge_quiz_questions for select using(public.is_admin_or_moderator() or exists(select 1 from public.knowledge_quizzes q where q.id=quiz_id and q.status='published' and public.can_access_knowledge_lesson(q.lesson_id)));
create policy "Editors manage questions insert" on public.knowledge_quiz_questions for insert with check(public.is_admin_or_moderator());
create policy "Editors manage questions update" on public.knowledge_quiz_questions for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors manage questions delete" on public.knowledge_quiz_questions for delete using(public.is_admin_or_moderator());
create policy "Editors view answer keys" on public.knowledge_quiz_answer_keys for select using(public.is_admin_or_moderator());
create policy "Editors manage answer keys insert" on public.knowledge_quiz_answer_keys for insert with check(public.is_admin_or_moderator());
create policy "Editors manage answer keys update" on public.knowledge_quiz_answer_keys for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Editors manage answer keys delete" on public.knowledge_quiz_answer_keys for delete using(public.is_admin_or_moderator());
create policy "Users view own quiz attempts" on public.knowledge_quiz_attempts for select to authenticated using(user_id=auth.uid() or public.is_admin_or_moderator());

create or replace function public.submit_knowledge_quiz(p_quiz_id bigint,p_answers jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid();v_score numeric:=0;v_max numeric:=0;v_pass numeric;v_pct numeric;v_attempt bigint;r record;v_given jsonb;
begin
 if v_user is null then raise exception 'Authentication required';end if;
 if jsonb_typeof(p_answers)<>'object' then raise exception 'Invalid answers';end if;
 select passing_score into v_pass from public.knowledge_quizzes where id=p_quiz_id and status='published' and public.can_access_knowledge_lesson(lesson_id);if not found then raise exception 'Quiz unavailable';end if;
 if exists(select 1 from public.knowledge_quiz_attempts where quiz_id=p_quiz_id and user_id=v_user and created_at>now()-interval '10 seconds') then raise exception 'Please wait before retrying';end if;
 for r in select q.id,q.question_type,q.points,k.correct_answer from public.knowledge_quiz_questions q join public.knowledge_quiz_answer_keys k on k.question_id=q.id where q.quiz_id=p_quiz_id loop
  v_max:=v_max+r.points;v_given:=p_answers->r.id::text;
  if (r.question_type='multiple' and jsonb_typeof(v_given)='array' and v_given@>r.correct_answer and r.correct_answer@>v_given)
   or (r.question_type<>'multiple' and case when r.question_type in('fill','writing') then lower(btrim(coalesce(v_given#>>'{}','')))=lower(btrim(coalesce(r.correct_answer#>>'{}',''))) else v_given=r.correct_answer end)
  then v_score:=v_score+r.points;end if;
 end loop;
 if v_max<=0 then raise exception 'Quiz has no scored questions';end if;v_pct:=round(v_score/v_max*100,2);
 insert into public.knowledge_quiz_attempts(quiz_id,user_id,answers,score,max_score,percentage,passed) values(p_quiz_id,v_user,p_answers,v_score,v_max,v_pct,v_pct>=v_pass) returning id into v_attempt;
 return jsonb_build_object('attempt_id',v_attempt,'score',v_score,'max_score',v_max,'percentage',v_pct,'passed',v_pct>=v_pass);
end;$$;
revoke all on function public.submit_knowledge_quiz(bigint,jsonb) from public;grant execute on function public.submit_knowledge_quiz(bigint,jsonb) to authenticated;
create index if not exists knowledge_quizzes_lesson_idx on public.knowledge_quizzes(lesson_id,status,id);create index if not exists knowledge_quiz_questions_order_idx on public.knowledge_quiz_questions(quiz_id,position,id);create index if not exists knowledge_quiz_attempts_user_idx on public.knowledge_quiz_attempts(user_id,created_at desc);
