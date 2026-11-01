-- 013_company_agent_service – applied 1 Nov 2026
-- Company appeals (£59): authority to act signed on screen, HMRC agent authorisation code from the client.
alter table public.cases
  add column if not exists authority_name text,
  add column if not exists authority_version text,
  add column if not exists hmrc_code text,
  add column if not exists hmrc_code_at timestamptz,
  add column if not exists hmrc_code_requested_at timestamptz;

alter table public.email_log drop constraint email_log_email_type_check;
alter table public.email_log add constraint email_log_email_type_check check (email_type = any (array[
  'appeal_pdf','case_link','payment_link','id_request','ready_to_sign','posted','callback_confirm','help_confirm',
  'hmrc_code_request','appeal_ready','other']));

alter table public.cases drop constraint cases_status_check;
alter table public.cases add constraint cases_status_check check (status = any (array[
  'uploaded','explained','questions','outcome','callback_requested','awaiting_payment','paid','awaiting_id',
  'in_review','awaiting_hmrc_code','awaiting_signature','approved','sent','submitted','posted','closed','deleted']));
