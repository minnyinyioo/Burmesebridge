-- Rich media for existing news entries. Files live in the small public
-- content-media bucket; video files remain on YouTube and only URLs are saved.
alter table public.news
  add column if not exists media_blocks jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media',
  'content-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view content media" on storage.objects;
create policy "Public can view content media"
on storage.objects for select
using (bucket_id = 'content-media');

drop policy if exists "Editors can upload content media" on storage.objects;
create policy "Editors can upload content media"
on storage.objects for insert to authenticated
with check (bucket_id = 'content-media' and public.is_admin_or_moderator());

drop policy if exists "Editors can delete content media" on storage.objects;
create policy "Editors can delete content media"
on storage.objects for delete to authenticated
using (bucket_id = 'content-media' and public.is_admin_or_moderator());

create table if not exists public.knowledge_products (
  id bigint generated always as identity primary key,
  title_my text,
  title_zh text,
  title_en text,
  description_my text,
  description_zh text,
  description_en text,
  content_my text,
  content_zh text,
  content_en text,
  cover_url text,
  preview_youtube_id text check (preview_youtube_id is null or preview_youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  price numeric(12,2) not null default 0 check (price >= 0),
  currency text not null default 'MMK' check (currency in ('MMK', 'CNY', 'USD')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(title_my, title_zh, title_en, '') <> '')
);

create table if not exists public.knowledge_purchase_requests (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.knowledge_products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_reference text not null check (char_length(payment_reference) between 2 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(product_id, user_id)
);

create table if not exists public.knowledge_access (
  product_id bigint not null references public.knowledge_products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

alter table public.knowledge_products enable row level security;
alter table public.knowledge_purchase_requests enable row level security;
alter table public.knowledge_access enable row level security;

create policy "Public can view published knowledge" on public.knowledge_products
for select using (status = 'published' or public.is_admin_or_moderator());
create policy "Editors can create knowledge" on public.knowledge_products
for insert with check (public.is_admin_or_moderator());
create policy "Editors can update knowledge" on public.knowledge_products
for update using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());
create policy "Editors can delete knowledge" on public.knowledge_products
for delete using (public.is_admin_or_moderator());

create policy "Users can view own purchase requests" on public.knowledge_purchase_requests
for select using (user_id = auth.uid() or public.is_admin_or_moderator());
create policy "Users can request knowledge access" on public.knowledge_purchase_requests
for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "Editors can review purchase requests" on public.knowledge_purchase_requests
for update using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());

create policy "Users can view own knowledge access" on public.knowledge_access
for select using (user_id = auth.uid() or public.is_admin_or_moderator());
create policy "Editors can grant knowledge access" on public.knowledge_access
for insert with check (public.is_admin_or_moderator());
create policy "Editors can revoke knowledge access" on public.knowledge_access
for delete using (public.is_admin_or_moderator());

create or replace function public.grant_approved_knowledge_access()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    new.reviewer_id := auth.uid();
    new.reviewed_at := now();
    insert into public.knowledge_access(product_id, user_id, granted_by)
    values(new.product_id, new.user_id, auth.uid())
    on conflict (product_id, user_id) do nothing;
  elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.reviewer_id := auth.uid();
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists grant_approved_knowledge_access on public.knowledge_purchase_requests;
create trigger grant_approved_knowledge_access
before update on public.knowledge_purchase_requests
for each row execute function public.grant_approved_knowledge_access();

create index if not exists knowledge_products_status_created_idx
on public.knowledge_products(status, created_at desc);
create index if not exists knowledge_requests_status_created_idx
on public.knowledge_purchase_requests(status, created_at desc);
