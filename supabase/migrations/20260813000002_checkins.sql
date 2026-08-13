alter table public.checkins
add column if not exists checkin_date date;

alter table public.checkins
add constraint checkins_user_date_unique
unique (user_id, checkin_date);