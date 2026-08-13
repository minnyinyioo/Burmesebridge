alter table public.news
add column if not exists category text default 'news';

alter table public.news
add column if not exists title_my text;

alter table public.news
add column if not exists title_zh text;

alter table public.news
add column if not exists title_en text;

alter table public.news
add column if not exists content_my text;

alter table public.news
add column if not exists content_zh text;

alter table public.news
add column if not exists content_en text;

alter table public.news
add column if not exists source_language text default 'my';

update public.news
set category = 'news'
where category is null;