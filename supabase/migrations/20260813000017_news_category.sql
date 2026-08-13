alter table public.news
add column if not exists category text default 'news';

update public.news
set category = 'news'
where category is null;