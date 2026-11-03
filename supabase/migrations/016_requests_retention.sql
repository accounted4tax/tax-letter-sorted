-- 016_requests_retention – NOT YET APPLIED (waiting for Eduard's approval in Supabase)
-- Help, quote and call-back requests are kept for up to 12 months (Privacy Policy, 3 Nov 2026).
select cron.schedule('requests-retention-daily', '17 3 * * *', $$
  delete from public.help_requests where created_at < now() - interval '12 months' and status <> 'client';
  delete from public.callbacks where created_at < now() - interval '12 months';
$$);
