update public.profiles
set role='admin',
badge='admin',
verified=true
where email='minnyinyioo616@gmail.com';

update public.profiles
set role='member',
badge='member',
verified=false
where email<>'minnyinyioo616@gmail.com';