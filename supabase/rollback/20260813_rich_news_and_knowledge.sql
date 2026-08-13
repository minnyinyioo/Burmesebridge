drop trigger if exists grant_approved_knowledge_access on public.knowledge_purchase_requests;
drop function if exists public.grant_approved_knowledge_access();
drop table if exists public.knowledge_access;
drop table if exists public.knowledge_purchase_requests;
drop table if exists public.knowledge_products;
alter table public.news drop column if exists media_blocks;
delete from storage.objects where bucket_id = 'content-media';
delete from storage.buckets where id = 'content-media';
