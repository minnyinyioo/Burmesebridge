create or replace function public.guard_hsk_course_publication()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.catalog_key like 'hsk-%' and new.status='published' and (old.status is distinct from 'published') then
    if not exists(select 1 from public.knowledge_resource_licenses r where r.product_id=new.id and r.verified_at is not null) then
      raise exception 'HSK publication blocked: verify at least one licensed resource';
    end if;
    if not exists(select 1 from public.knowledge_lessons l where l.product_id=new.id and l.status='published') then
      raise exception 'HSK publication blocked: publish at least one lesson';
    end if;
    if exists(
      select 1 from public.knowledge_lessons l
      where l.product_id=new.id and l.status='published'
      and not exists(select 1 from public.knowledge_lesson_content c where c.lesson_id=l.id and coalesce(c.body_my,c.body_zh,c.body_en,'')<>'')
    ) then
      raise exception 'HSK publication blocked: every published lesson needs content';
    end if;
  end if;
  return new;
end;$$;

drop trigger if exists guard_hsk_course_publication_trigger on public.knowledge_products;
create trigger guard_hsk_course_publication_trigger before update of status on public.knowledge_products
for each row execute function public.guard_hsk_course_publication();

create or replace function public.get_hsk_course_readiness()
returns table(product_id bigint,catalog_key text,published_lessons bigint,content_lessons bigint,verified_resources bigint,ready boolean)
language sql security invoker stable set search_path=public as $$
  select p.id,p.catalog_key,
    count(distinct l.id) filter(where l.status='published')::bigint,
    count(distinct c.lesson_id) filter(where l.status='published' and coalesce(c.body_my,c.body_zh,c.body_en,'')<>'')::bigint,
    count(distinct r.id) filter(where r.verified_at is not null)::bigint,
    count(distinct l.id) filter(where l.status='published')>0
      and count(distinct l.id) filter(where l.status='published')=count(distinct c.lesson_id) filter(where l.status='published' and coalesce(c.body_my,c.body_zh,c.body_en,'')<>'')
      and count(distinct r.id) filter(where r.verified_at is not null)>0
  from public.knowledge_products p
  left join public.knowledge_lessons l on l.product_id=p.id
  left join public.knowledge_lesson_content c on c.lesson_id=l.id
  left join public.knowledge_resource_licenses r on r.product_id=p.id
  where p.catalog_key like 'hsk-%' and public.is_admin_or_moderator()
  group by p.id,p.catalog_key order by p.catalog_key;
$$;
revoke all on function public.get_hsk_course_readiness() from public;
grant execute on function public.get_hsk_course_readiness() to authenticated;
