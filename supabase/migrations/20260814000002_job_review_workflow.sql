alter table public.news
  add column if not exists recruitment_review_note text,
  add column if not exists recruitment_reviewer_id uuid references public.profiles(id) on delete set null,
  add column if not exists recruitment_reviewed_at timestamptz;

alter table public.news
  add constraint recruitment_review_note_length check (recruitment_review_note is null or char_length(recruitment_review_note) <= 1500) not valid;

create or replace function public.protect_job_verification_workflow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.category = 'jobs'
    and (
      (tg_op = 'INSERT' and coalesce(new.recruitment_verification, 'unverified') <> 'unverified')
      or (tg_op = 'UPDATE' and new.recruitment_verification is distinct from coalesce(old.recruitment_verification, 'unverified'))
    ) then
    if new.recruitment_verification = 'verified' and not public.is_admin() then
      raise exception 'Only administrators can verify job listings' using errcode = '42501';
    end if;
    if not public.is_admin_or_moderator() then
      raise exception 'Moderator access required' using errcode = '42501';
    end if;
    new.recruitment_reviewer_id := auth.uid();
    new.recruitment_reviewed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists protect_job_verification_workflow on public.news;
create trigger protect_job_verification_workflow
before insert or update on public.news
for each row execute function public.protect_job_verification_workflow();

create index if not exists news_job_verification_idx
on public.news(recruitment_verification, created_at desc) where category = 'jobs';
