-- News extra flags
-- 不影响旧数据
-- if not exists 防止重复执行

alter table news
add column if not exists pinned boolean default false;

alter table news
add column if not exists featured boolean default false;

alter table news
add column if not exists hot boolean default false;
