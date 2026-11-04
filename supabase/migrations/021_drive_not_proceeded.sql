-- 021: monthly (1st of the month, 02:23) – Drive folders of people who never paid, 30+ days old → Client files/Not proceeded
select cron.schedule('drive-not-proceeded-monthly', '23 2 1 * *', $$
  select net.http_post(
    url := 'https://pmngappuatunbhodqipn.supabase.co/functions/v1/drive-sync',
    headers := jsonb_build_object('Content-Type','application/json',
                                  'x-cron-secret', (select cron_secret from public.app_settings where id = 1)),
    body := '{"action":"cleanup"}'::jsonb, timeout_milliseconds := 120000);
$$);
