alter table public.knowledge_products
  add column if not exists content_my text,
  add column if not exists content_zh text,
  add column if not exists content_en text;
update public.knowledge_products product set
  content_my = content.content_my,
  content_zh = content.content_zh,
  content_en = content.content_en
from public.knowledge_product_content content where content.product_id = product.id;
drop table if exists public.knowledge_product_content;
