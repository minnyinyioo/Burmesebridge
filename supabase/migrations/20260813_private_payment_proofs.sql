alter table public.knowledge_purchase_requests
  add column if not exists proof_path text,
  add column if not exists review_note text;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('payment-proofs','payment-proofs',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "Users and editors can view payment proofs" on storage.objects for select to authenticated
using(bucket_id='payment-proofs' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin_or_moderator()));
create policy "Users can upload own payment proofs" on storage.objects for insert to authenticated
with check(bucket_id='payment-proofs' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Users can replace own payment proofs" on storage.objects for update to authenticated
using(bucket_id='payment-proofs' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='payment-proofs' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Users and editors can delete payment proofs" on storage.objects for delete to authenticated
using(bucket_id='payment-proofs' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin_or_moderator()));
