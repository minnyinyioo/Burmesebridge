create table if not exists public.knowledge_payment_methods (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 80),
  account_name text not null check (char_length(account_name) between 2 and 120),
  account_number text not null check (char_length(account_number) between 2 and 120),
  instructions_my text,
  instructions_zh text,
  instructions_en text,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge_payment_methods enable row level security;
create policy "Public can view enabled payment methods"
on public.knowledge_payment_methods for select
using (enabled or public.is_admin_or_moderator());
create policy "Editors can create payment methods"
on public.knowledge_payment_methods for insert
with check (public.is_admin_or_moderator());
create policy "Editors can update payment methods"
on public.knowledge_payment_methods for update
using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());
create policy "Editors can delete payment methods"
on public.knowledge_payment_methods for delete
using (public.is_admin_or_moderator());
create index if not exists knowledge_payment_methods_enabled_sort_idx
on public.knowledge_payment_methods(enabled, sort_order, created_at);
