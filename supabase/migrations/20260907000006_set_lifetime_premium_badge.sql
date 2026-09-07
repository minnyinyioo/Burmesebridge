update public.knowledge_membership_plans
set badge_type = 'premium', updated_at = now()
where code = 'lifetime';
