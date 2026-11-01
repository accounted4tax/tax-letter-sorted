-- 014_admin – applied 1 Nov 2026
-- Admin page: who may sign in, Eduard's own appeal wording and notes per case.
alter table public.app_settings add column if not exists admin_emails text[] not null default array['info@mytacs.co.uk','info@accounted4tax.co.uk'];
alter table public.cases
  add column if not exists admin_appeal_text text,
  add column if not exists admin_notes text;
alter table public.help_requests add column if not exists admin_notes text;
