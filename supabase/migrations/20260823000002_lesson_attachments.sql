create table if not exists public.knowledge_lesson_attachments (
  id bigint generated always as identity primary key,
  lesson_id bigint not null references public.knowledge_lessons(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  file_url text not null check (file_url ~ '^https://'),
  file_type text not null default 'application/pdf',
  file_size bigint not null check (file_size between 1 and 5242880),
  created_at timestamptz not null default now()
);

alter table public.knowledge_lesson_attachments enable row level security;

create policy "Learners can view lesson attachments"
on public.knowledge_lesson_attachments for select using (
  public.is_admin_or_moderator()
  or exists (
    select 1 from public.knowledge_lessons lesson
    join public.knowledge_products product on product.id = lesson.product_id
    where lesson.id = knowledge_lesson_attachments.lesson_id
      and lesson.status = 'published' and product.status = 'published'
      and (
        lesson.free_preview or product.price = 0
        or exists (
          select 1 from public.knowledge_access access
          where access.product_id = product.id and access.user_id = auth.uid()
        )
        or exists (
          select 1 from public.knowledge_memberships membership
          where membership.user_id = auth.uid()
            and (membership.expires_at is null or membership.expires_at > now())
        )
      )
  )
);

create policy "Editors can create lesson attachments"
on public.knowledge_lesson_attachments for insert
with check (public.is_admin_or_moderator());
create policy "Editors can delete lesson attachments"
on public.knowledge_lesson_attachments for delete
using (public.is_admin_or_moderator());

update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','application/pdf']
where id = 'content-media';

create index if not exists knowledge_lesson_attachments_lesson_idx
on public.knowledge_lesson_attachments(lesson_id, created_at);
