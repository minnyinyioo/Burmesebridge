drop policy if exists "Learners can download course attachments" on storage.objects;
drop policy if exists "Editors can upload course attachments" on storage.objects;
drop policy if exists "Editors can delete course attachments" on storage.objects;
delete from storage.buckets where id='course-attachments';
alter table if exists public.knowledge_lesson_attachments rename column object_path to file_url;
