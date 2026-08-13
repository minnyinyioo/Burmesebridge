create table if not exists public.user_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('purchase_approved','purchase_rejected','system')),
  title text not null check (char_length(title) between 1 and 160),
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_notifications enable row level security;
drop policy if exists "Users can read own notifications" on public.user_notifications;
create policy "Users can read own notifications" on public.user_notifications
for select to authenticated using (user_id=auth.uid());
drop policy if exists "Users can mark own notifications read" on public.user_notifications;
create policy "Users can mark own notifications read" on public.user_notifications
for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "Users can delete own notifications" on public.user_notifications;
create policy "Users can delete own notifications" on public.user_notifications
for delete to authenticated using (user_id=auth.uid());

create or replace function public.notify_knowledge_purchase_review()
returns trigger language plpgsql security definer set search_path=public as $$
declare course_title text;
begin
  if new.status in ('approved','rejected') and old.status is distinct from new.status then
    select coalesce(title_my,title_zh,title_en,'Course') into course_title
    from public.knowledge_products where id=new.product_id;
    insert into public.user_notifications(user_id,type,title,body,href)
    values(
      new.user_id,
      case when new.status='approved' then 'purchase_approved' else 'purchase_rejected' end,
      case when new.status='approved' then 'Course access approved' else 'Payment review needs attention' end,
      course_title || case when new.review_note is not null then E'\n' || new.review_note else '' end,
      '/knowledge/' || new.product_id
    );
  end if;
  return new;
end;
$$;
drop trigger if exists notify_knowledge_purchase_review on public.knowledge_purchase_requests;
create trigger notify_knowledge_purchase_review after update on public.knowledge_purchase_requests
for each row execute function public.notify_knowledge_purchase_review();
create index if not exists user_notifications_user_created_idx on public.user_notifications(user_id,created_at desc);
create index if not exists user_notifications_unread_idx on public.user_notifications(user_id,read_at) where read_at is null;
