-- 020: copy client records to Eduard's Google Drive (drive-sync function). Remembers what was copied.
create table if not exists public.drive_sync_items (
  item_key text primary key,              -- "<case ref>:<item>" or "hr:<help request id>"
  case_id uuid references public.cases(id) on delete set null,
  synced_at timestamptz not null default now()
);
alter table public.drive_sync_items enable row level security;   -- server only (no policies)
select cron.schedule('drive-sync-15min', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://pmngappuatunbhodqipn.supabase.co/functions/v1/drive-sync',
    headers := jsonb_build_object('Content-Type','application/json',
                                  'x-cron-secret', (select cron_secret from public.app_settings where id = 1)),
    body := '{}'::jsonb, timeout_milliseconds := 120000);
$$);
