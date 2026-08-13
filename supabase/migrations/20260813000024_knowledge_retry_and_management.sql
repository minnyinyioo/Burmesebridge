-- Users may correct a rejected payment reference and resubmit it for review.
create policy "Users can retry rejected purchase requests"
on public.knowledge_purchase_requests for update to authenticated
using (user_id = auth.uid() and status = 'rejected')
with check (user_id = auth.uid() and status = 'pending' and reviewer_id is null and reviewed_at is null);

create index if not exists knowledge_access_user_idx
on public.knowledge_access(user_id, granted_at desc);
