alter table profiles
add column if not exists role text default 'member';

alter table profiles
add column if not exists banned_until timestamptz;

alter table profiles
add column if not exists ban_reason text;