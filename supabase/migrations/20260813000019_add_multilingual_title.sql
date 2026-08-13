alter table public.news
add column if not exists title_my text,
add column if not exists title_zh text,
add column if not exists title_en text,
add column if not exists content_my text,
add column if not exists content_zh text,
add column if not exists content_en text;