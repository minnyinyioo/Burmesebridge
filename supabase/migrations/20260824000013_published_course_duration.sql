-- Replace catalog-plan duration with the duration of content that is actually
-- published. Future lesson changes keep the course total synchronized.
update public.knowledge_lessons
set duration_seconds=case
  when catalog_key like 'hsk-1-%' then 25*60
  when catalog_key like 'hsk-2-%' then 35*60
  when catalog_key like 'hsk-3-%' then 45*60
  when catalog_key like 'hsk-4-%' then 60*60
  when catalog_key like 'hsk-5-%' then 75*60
  when catalog_key like 'hsk-6-%' then 90*60
  else duration_seconds end
where status='published' and catalog_key like 'hsk-%' and duration_seconds=0;

create or replace function public.sync_knowledge_product_duration(p_product_id bigint)
returns void language sql security definer set search_path=public as $$
  update public.knowledge_products p
  set estimated_minutes=coalesce((
    select ceil(sum(l.duration_seconds)/60.0)::integer
    from public.knowledge_lessons l
    where l.product_id=p_product_id and l.status='published'
  ),0)
  where p.id=p_product_id;
$$;

create or replace function public.on_knowledge_lesson_duration_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='DELETE' then
    perform public.sync_knowledge_product_duration(old.product_id);
    return old;
  end if;
  perform public.sync_knowledge_product_duration(new.product_id);
  if tg_op='UPDATE' and old.product_id is distinct from new.product_id then
    perform public.sync_knowledge_product_duration(old.product_id);
  end if;
  return new;
end;$$;

drop trigger if exists knowledge_lesson_duration_sync on public.knowledge_lessons;
create trigger knowledge_lesson_duration_sync
after insert or update of duration_seconds,status,product_id or delete on public.knowledge_lessons
for each row execute function public.on_knowledge_lesson_duration_change();

update public.knowledge_products p
set estimated_minutes=coalesce((
  select ceil(sum(l.duration_seconds)/60.0)::integer
  from public.knowledge_lessons l
  where l.product_id=p.id and l.status='published'
),0)
where p.catalog_key like 'hsk-%';

revoke all on function public.sync_knowledge_product_duration(bigint) from public;
