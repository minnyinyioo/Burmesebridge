alter table public.knowledge_products add column if not exists catalog_key text;
create unique index if not exists knowledge_products_catalog_key_unique on public.knowledge_products(catalog_key) where catalog_key is not null;

create or replace function public.initialize_hsk_course_catalog()
returns integer language plpgsql security invoker set search_path=public as $$
declare inserted_count integer;
begin
  if not public.is_admin_or_moderator() then raise exception 'Admin or moderator required'; end if;
  insert into public.knowledge_products(
    catalog_key,title_zh,title_my,title_en,description_zh,description_my,description_en,
    level,skill,teacher_name,learning_objectives,target_audience,estimated_minutes,price,currency,status,author_id
  )
  select
    'hsk-'||level_no||'-'||skill_key,
    'HSK '||level_no||' '||skill_zh,
    'HSK '||level_no||' '||skill_my,
    'HSK '||level_no||' '||skill_en,
    '按 HSK '||level_no||' 等级系统学习'||skill_zh||'。课程内容需通过许可证核验后发布。',
    'HSK '||level_no||' အဆင့် '||skill_my||' သင်တန်း။ အရင်းအမြစ် License စစ်ဆေးပြီးမှ ထုတ်ဝေရန်။',
    'Structured HSK '||level_no||' '||lower(skill_en)||'. Publish only after all learning resources are license-verified.',
    'HSK '||level_no,skill_en,'BurmeseBridge Curriculum Team',
    jsonb_build_array('Build HSK '||level_no||' '||lower(skill_en)||' competence','Complete graded practice and assessment'),
    jsonb_build_array('Learners preparing for HSK '||level_no),
    case when level_no<3 then 336 when level_no<5 then 448 else 560 end,
    0,'MMK','draft',auth.uid()
  from generate_series(1,6) level_no
  cross join (values
    ('listening','听力','နားထောင်ခြင်း','Listening'),
    ('speaking','口语','ပြောဆိုခြင်း','Speaking'),
    ('reading','阅读','ဖတ်ရှုခြင်း','Reading'),
    ('writing','书写','ရေးသားခြင်း','Writing')
  ) skills(skill_key,skill_zh,skill_my,skill_en)
  on conflict(catalog_key) where catalog_key is not null do nothing;
  get diagnostics inserted_count=row_count;
  return inserted_count;
end;$$;
revoke all on function public.initialize_hsk_course_catalog() from public;
grant execute on function public.initialize_hsk_course_catalog() to authenticated;
