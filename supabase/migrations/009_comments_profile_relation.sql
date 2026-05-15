alter table public.post_comments
drop constraint if exists post_comments_user_profile_fk;

alter table public.post_comments
add constraint post_comments_user_profile_fk
foreign key (user_id)
references public.profiles(id)
on delete cascade;