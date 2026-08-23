update storage.buckets
set file_size_limit=15728640,
    allowed_mime_types=array[
      'application/pdf','image/jpeg','image/png','image/webp',
      'audio/mpeg','audio/webm','audio/ogg','audio/mp4'
    ]
where id='assignment-submissions';

alter table public.knowledge_assignment_submissions
  add column if not exists object_mime text,
  add column if not exists object_size bigint;

alter table public.knowledge_assignment_submissions
  drop constraint if exists knowledge_assignment_submission_object_metadata_check;
alter table public.knowledge_assignment_submissions
  add constraint knowledge_assignment_submission_object_metadata_check check(
    (object_path is null and object_mime is null and object_size is null)
    or (object_path is not null and object_mime is null and object_size is null)
    or (object_path is not null
      and object_mime in ('application/pdf','image/jpeg','image/png','image/webp','audio/mpeg','audio/webm','audio/ogg','audio/mp4')
      and object_size between 1 and 15728640)
  ) not valid;
