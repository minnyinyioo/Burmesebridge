-- Payment account details must never be part of the anonymous course catalogue.
-- Authenticated buyers fetch them only after explicitly opening checkout.
drop policy if exists "Public can view enabled payment methods" on public.knowledge_payment_methods;
drop policy if exists "Authenticated users can view enabled payment methods" on public.knowledge_payment_methods;
create policy "Authenticated users can view enabled payment methods"
on public.knowledge_payment_methods for select to authenticated
using (enabled or public.is_admin_or_moderator());
