-- Product security baseline: centralized role checks, user reports, appeals and audit logs.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_admin_or_moderator()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'moderator'));
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin_or_moderator() from public;
grant execute on function public.is_admin(), public.is_admin_or_moderator() to authenticated, anon;

create table if not exists public.content_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'news', 'video', 'profile')),
  target_id text not null,
  reason text not null check (reason in ('spam', 'harassment', 'hate', 'misinformation', 'copyright', 'illegal', 'other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'resolved', 'rejected')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  resolution_note text check (char_length(resolution_note) <= 1000),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (reporter_id, target_type, target_id)
);

create table if not exists public.moderation_appeals (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null check (action_type in ('content_removed', 'account_banned', 'verification_rejected', 'other')),
  action_reference text,
  reason text not null check (char_length(reason) between 10 and 1500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.content_reports enable row level security;
alter table public.moderation_appeals enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy "Users submit reports" on public.content_reports for insert to authenticated
with check (reporter_id = auth.uid() and status = 'pending' and reviewer_id is null);
create policy "Users read own reports" on public.content_reports for select to authenticated
using (reporter_id = auth.uid() or public.is_admin_or_moderator());
create policy "Moderators review reports" on public.content_reports for update to authenticated
using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());

create policy "Users submit appeals" on public.moderation_appeals for insert to authenticated
with check (user_id = auth.uid() and status = 'pending' and reviewer_id is null);
create policy "Users read own appeals" on public.moderation_appeals for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy "Admins review appeals" on public.moderation_appeals for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins read audit logs" on public.admin_audit_logs for select to authenticated
using (public.is_admin());

create or replace function public.capture_admin_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare row_id text;
begin
  if not public.is_admin_or_moderator() then return coalesce(new, old); end if;
  row_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id');
  insert into public.admin_audit_logs(actor_id, action, target_table, target_id, before_data, after_data)
  values (auth.uid(), tg_op, tg_table_name, row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','news','posts','post_comments','verification_requests','knowledge_purchase_requests','content_reports','moderation_appeals'] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('drop trigger if exists audit_admin_changes on public.%I', table_name);
      execute format('create trigger audit_admin_changes after insert or update or delete on public.%I for each row execute function public.capture_admin_audit()', table_name);
    end if;
  end loop;
end $$;

create index if not exists content_reports_status_created_idx on public.content_reports(status, created_at desc);
create index if not exists moderation_appeals_status_created_idx on public.moderation_appeals(status, created_at desc);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs(created_at desc);

