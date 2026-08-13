-- Prevent anonymous database spam and bound user-controlled feedback fields.
drop policy if exists "Anyone submits feedback" on public.feedback_reports;

create policy "Authenticated users submit feedback"
on public.feedback_reports for insert to authenticated
with check (user_id = auth.uid() and status = 'open');

alter table public.feedback_reports
  add constraint feedback_title_length check (char_length(title) between 3 and 160) not valid,
  add constraint feedback_description_length check (char_length(description) between 10 and 5000) not valid,
  add constraint feedback_contact_length check (contact is null or char_length(contact) <= 200) not valid,
  add constraint feedback_page_url_length check (page_url is null or char_length(page_url) <= 1000) not valid;
