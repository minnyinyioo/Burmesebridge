alter table public.posts
add constraint posts_user_profile_fk
foreign key (user_id)
references public.profiles(id)
on delete cascade;