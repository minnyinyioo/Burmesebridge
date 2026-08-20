update public.knowledge_membership_plans
set enabled = false, updated_at = now()
where price <= 0;

alter table public.knowledge_membership_plans
drop constraint if exists knowledge_membership_plans_enabled_price_check;

alter table public.knowledge_membership_plans
add constraint knowledge_membership_plans_enabled_price_check
check (not enabled or price > 0);
