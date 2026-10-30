-- Hourly retention clean-up. The secret lives only in the database (app_settings.cron_secret).
create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.app_settings add column if not exists cron_secret text;
update public.app_settings set cron_secret = '<set privately>' where id = 1 and cron_secret is null;

select cron.schedule(
  'cleanup-expired-hourly',
  '7 * * * *',
  $$
  select net.http_post(
    url := 'https://pmngappuatunbhodqipn.supabase.co/functions/v1/cleanup-expired',
    headers := jsonb_build_object('Content-Type','application/json',
                                  'x-cron-secret', (select cron_secret from public.app_settings where id = 1)),
    body := '{}'::jsonb
  );
  $$
);
