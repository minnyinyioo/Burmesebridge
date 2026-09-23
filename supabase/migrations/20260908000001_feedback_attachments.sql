alter table public.feedback_reports
  add column if not exists attachment_path text,
  add column if not exists attachment_mime text,
  add column if not exists attachment_size bigint;

alter table public.feedback_reports
  drop constraint if exists feedback_attachment_path_length,
  drop constraint if exists feedback_attachment_mime_allowed,
  drop constraint if exists feedback_attachment_size_limit;

alter table public.feedback_reports
  add constraint feedback_attachment_path_length check (attachment_path is null or char_length(attachment_path) <= 500),
  add constraint feedback_attachment_mime_allowed check (attachment_mime is null or attachment_mime in ('image/jpeg','image/png','image/webp')),
  add constraint feedback_attachment_size_limit check (attachment_size is null or attachment_size between 1 and 5242880);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('feedback-attachments','feedback-attachments',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Users upload own feedback attachments" on storage.objects;
create policy "Users upload own feedback attachments" on storage.objects
for insert to authenticated
with check (bucket_id='feedback-attachments' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "Users and admins view feedback attachments" on storage.objects;
create policy "Users and admins view feedback attachments" on storage.objects
for select to authenticated
using (bucket_id='feedback-attachments' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin_or_moderator()));

drop policy if exists "Users and admins delete feedback attachments" on storage.objects;
create policy "Users and admins delete feedback attachments" on storage.objects
for delete to authenticated
using (bucket_id='feedback-attachments' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin_or_moderator()));
