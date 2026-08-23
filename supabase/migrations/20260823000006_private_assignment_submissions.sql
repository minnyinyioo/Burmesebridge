insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('assignment-submissions','assignment-submissions',false,5242880,array['application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Users can upload own assignment files" on storage.objects;
create policy "Users can upload own assignment files" on storage.objects for insert to authenticated
with check(bucket_id='assignment-submissions' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Users can view own assignment files" on storage.objects;
create policy "Users can view own assignment files" on storage.objects for select to authenticated
using(bucket_id='assignment-submissions' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin_or_moderator()));
drop policy if exists "Users can replace own assignment files" on storage.objects;
create policy "Users can replace own assignment files" on storage.objects for update to authenticated
using(bucket_id='assignment-submissions' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='assignment-submissions' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Users can delete own assignment files" on storage.objects;
create policy "Users can delete own assignment files" on storage.objects for delete to authenticated
using(bucket_id='assignment-submissions' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin_or_moderator()));

drop policy if exists "Users can create own submissions" on public.knowledge_assignment_submissions;
create policy "Users can create own submissions" on public.knowledge_assignment_submissions for insert to authenticated
with check(user_id=auth.uid() and status in('draft','submitted') and score is null and feedback is null and graded_by is null
and exists(select 1 from public.knowledge_assignments assignment where assignment.id=assignment_id and assignment.status='published'));

