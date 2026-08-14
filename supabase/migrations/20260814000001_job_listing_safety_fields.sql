alter table public.news
  add column if not exists employer_name text,
  add column if not exists employer_registration text,
  add column if not exists job_location text,
  add column if not exists salary_details text,
  add column if not exists application_contact text,
  add column if not exists recruitment_verification text not null default 'unverified',
  add column if not exists recruitment_safety_confirmed boolean not null default false;

alter table public.news
  add constraint news_employer_name_length check (employer_name is null or char_length(employer_name) <= 160) not valid,
  add constraint news_employer_registration_length check (employer_registration is null or char_length(employer_registration) <= 200) not valid,
  add constraint news_job_location_length check (job_location is null or char_length(job_location) <= 200) not valid,
  add constraint news_salary_details_length check (salary_details is null or char_length(salary_details) <= 200) not valid,
  add constraint news_application_contact_length check (application_contact is null or char_length(application_contact) <= 300) not valid,
  add constraint news_recruitment_verification_allowed check (recruitment_verification in ('unverified','reviewed','verified')) not valid,
  add constraint published_jobs_require_safety_fields check (
    category <> 'jobs' or status <> 'published' or (
      nullif(trim(employer_name), '') is not null
      and nullif(trim(job_location), '') is not null
      and nullif(trim(application_contact), '') is not null
      and recruitment_safety_confirmed = true
    )
  ) not valid;
