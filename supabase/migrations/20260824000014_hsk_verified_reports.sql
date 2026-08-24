alter table public.hsk_assessment_attempts
  add column if not exists report_code text,
  add column if not exists skill_breakdown jsonb not null default '[]'::jsonb;

update public.hsk_assessment_attempts
set report_code = 'BB-HSK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
where report_code is null;

alter table public.hsk_assessment_attempts
  alter column report_code set default ('BB-HSK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  alter column report_code set not null;

create unique index if not exists hsk_assessment_attempts_report_code_idx
  on public.hsk_assessment_attempts(report_code);

create or replace view public.hsk_public_results
with (security_barrier = true)
as
select report_code, estimated_level, cefr_level, score, correct_answers,
       total_questions, level_breakdown, skill_breakdown, created_at
from public.hsk_assessment_attempts;

revoke all on public.hsk_public_results from public;
grant select on public.hsk_public_results to anon, authenticated;

