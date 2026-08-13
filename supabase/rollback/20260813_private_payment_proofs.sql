delete from storage.objects where bucket_id='payment-proofs';
delete from storage.buckets where id='payment-proofs';
alter table public.knowledge_purchase_requests drop column if exists proof_path,drop column if exists review_note;
