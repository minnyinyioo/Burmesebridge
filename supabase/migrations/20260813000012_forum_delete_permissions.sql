alter table public.posts enable row level security;

drop policy if exists "Users can delete own posts" on public.posts;
drop policy if exists "Moderators and admins can delete posts" on public.posts;

create policy "Users can delete own posts"
on public.posts
for delete
using (auth.uid() = user_id);

create policy "Moderators and admins can delete posts"
on public.posts
for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
    and profiles.badge in ('admin', 'moderator')
  )
);