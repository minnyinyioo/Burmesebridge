create table if not exists public.feedback_reports (
 id bigint generated always as identity primary key, user_id uuid references public.profiles(id) on delete set null,
 category text not null check(category in ('bug','suggestion','content','other')), title text not null, description text not null,
 page_url text, contact text, status text not null default 'open' check(status in ('open','reviewing','resolved','closed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.homepage_ads (
 id bigint generated always as identity primary key, title text not null, subtitle text, image_url text, target_url text,
 active boolean not null default true, sort_order integer not null default 0, starts_at timestamptz, ends_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.feedback_reports enable row level security;
alter table public.homepage_ads enable row level security;
create policy "Anyone submits feedback" on public.feedback_reports for insert with check(user_id is null or user_id=auth.uid());
create policy "Users read own feedback" on public.feedback_reports for select using(user_id=auth.uid() or public.is_admin_or_moderator());
create policy "Admins manage feedback" on public.feedback_reports for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Public reads active ads" on public.homepage_ads for select using(active or public.is_admin_or_moderator());
create policy "Admins create ads" on public.homepage_ads for insert with check(public.is_admin_or_moderator());
create policy "Admins update ads" on public.homepage_ads for update using(public.is_admin_or_moderator()) with check(public.is_admin_or_moderator());
create policy "Admins delete ads" on public.homepage_ads for delete using(public.is_admin_or_moderator());
