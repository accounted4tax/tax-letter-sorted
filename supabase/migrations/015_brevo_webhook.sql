-- 015_brevo_webhook – applied 2 Nov 2026
-- Brevo delivery webhook: a secret token in the webhook address (separate from the cron secret).
alter table public.app_settings add column if not exists webhook_secret text not null default encode(gen_random_bytes(24), 'hex');
create index if not exists email_log_provider_message_id_idx on public.email_log (provider_message_id);
