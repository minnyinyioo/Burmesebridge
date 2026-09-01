create table if not exists public.education_physical_card_requests(
 id bigint generated always as identity primary key,
 user_id uuid not null references public.profiles(id) on delete restrict,
 education_card_id bigint not null references public.education_id_cards(id) on delete restrict,
 shipping_name text not null check(char_length(shipping_name) between 2 and 120),
 shipping_phone text not null check(char_length(shipping_phone) between 6 and 40),
 shipping_address text not null check(char_length(shipping_address) between 10 and 1000),
 status text not null default 'pending' check(status in ('pending','approved','in_production','shipped','delivered','rejected','cancelled')),
 nfc_uid text unique,
 tracking_no text,
 review_note text check(review_note is null or char_length(review_note)<=1000),
 reviewed_by uuid references public.profiles(id) on delete set null,reviewed_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create unique index if not exists education_physical_card_open_guard on public.education_physical_card_requests(user_id,education_card_id) where status in ('pending','approved','in_production','shipped');
alter table public.education_physical_card_requests enable row level security;
create policy "Users view own physical card requests" on public.education_physical_card_requests for select to authenticated using(user_id=auth.uid() or public.can_access_admin_portal());

create or replace function public.request_physical_education_card(p_card_id bigint,p_name text,p_phone text,p_address text)
returns public.education_physical_card_requests language plpgsql security definer set search_path=public as $$
declare v_row public.education_physical_card_requests;
begin
 if not exists(select 1 from public.education_id_cards where id=p_card_id and user_id=auth.uid() and status='active' and expires_at>now()) then raise exception 'An active education ID is required';end if;
 insert into public.education_physical_card_requests(user_id,education_card_id,shipping_name,shipping_phone,shipping_address)
 values(auth.uid(),p_card_id,btrim(p_name),btrim(p_phone),btrim(p_address)) returning * into v_row;return v_row;
end;$$;
revoke all on function public.request_physical_education_card(bigint,text,text,text) from public;grant execute on function public.request_physical_education_card(bigint,text,text,text) to authenticated;

create or replace function public.review_physical_education_card_request(p_request_id bigint,p_status text,p_note text default null,p_nfc_uid text default null,p_tracking_no text default null)
returns public.education_physical_card_requests language plpgsql security definer set search_path=public as $$
declare v_row public.education_physical_card_requests;
begin
 if not public.can_access_admin_portal() then raise exception 'Administrator required';end if;
 if p_status not in ('approved','in_production','shipped','delivered','rejected','cancelled') then raise exception 'Invalid status';end if;
 if p_status in ('in_production','shipped','delivered') and nullif(btrim(p_nfc_uid),'') is null then raise exception 'NFC UID is required for production';end if;
 update public.education_physical_card_requests set status=p_status,review_note=nullif(btrim(p_note),''),nfc_uid=coalesce(nullif(btrim(p_nfc_uid),''),nfc_uid),tracking_no=coalesce(nullif(btrim(p_tracking_no),''),tracking_no),reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=p_request_id returning * into v_row;
 if not found then raise exception 'Request not found';end if;
 insert into public.admin_audit_logs(actor_id,action,target_table,target_id,after_data) values(auth.uid(),'physical_nfc_card_'||p_status,'education_physical_card_requests',p_request_id::text,to_jsonb(v_row));return v_row;
end;$$;
revoke all on function public.review_physical_education_card_request(bigint,text,text,text,text) from public;grant execute on function public.review_physical_education_card_request(bigint,text,text,text,text) to authenticated;
