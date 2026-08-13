-- Keep paid lesson bodies out of the publicly readable catalogue table.
create table if not exists public.knowledge_product_content (
  product_id bigint primary key references public.knowledge_products(id) on delete cascade,
  content_my text,
  content_zh text,
  content_en text,
  updated_at timestamptz not null default now()
);

insert into public.knowledge_product_content(product_id, content_my, content_zh, content_en)
select id, content_my, content_zh, content_en from public.knowledge_products
on conflict (product_id) do nothing;

alter table public.knowledge_products
  drop column if exists content_my,
  drop column if exists content_zh,
  drop column if exists content_en;

alter table public.knowledge_product_content enable row level security;

create policy "Entitled users can read knowledge content"
on public.knowledge_product_content for select
using (
  public.is_admin_or_moderator()
  or exists (
    select 1 from public.knowledge_products product
    where product.id = public.knowledge_product_content.product_id and product.status = 'published' and product.price = 0
  )
  or exists (
    select 1 from public.knowledge_access access
    where access.product_id = public.knowledge_product_content.product_id and access.user_id = auth.uid()
  )
);
create policy "Editors can create knowledge content"
on public.knowledge_product_content for insert
with check (public.is_admin_or_moderator());
create policy "Editors can update knowledge content"
on public.knowledge_product_content for update
using (public.is_admin_or_moderator()) with check (public.is_admin_or_moderator());
create policy "Editors can delete knowledge content"
on public.knowledge_product_content for delete
using (public.is_admin_or_moderator());
