-- 历史数据修正
update public.profiles
set role='member'
where role='user';

-- 设置默认值
alter table public.profiles
alter column role
set default 'member';