-- 022: practice quotes made in the admin page ("New quote"): PDF, email, client accepts on quote.html,
-- pays by Stripe (one-off catch-up + monthly subscription), reminders 1h / 24h / 72h / 7 days if accepted but not paid.
create sequence if not exists public.practice_quote_seq start 1;
create table if not exists public.practice_quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,                       -- A4T-Q-2026-0001
  token text unique not null,                        -- private link for the client
  created_at timestamptz not null default now(),
  created_by text,
  client jsonb not null default '{}'::jsonb,         -- name, company_name, company_number, address, email, phone
  items jsonb not null default '[]'::jsonb,          -- [{section: oneoff|yearend|monthly, label, qty, price}]
  spread_months int not null default 12,
  totals jsonb not null default '{}'::jsonb,         -- oneoff, yearend, yearend_monthly, monthly_services, monthly_total
  notes text,                                        -- extra lines shown on the quote (e.g. key dates)
  cover_text text,                                   -- email cover message
  valid_until date,
  status text not null default 'draft' check (status in ('draft','sent','accepted_unpaid','accepted','declined','expired')),
  sent_at timestamptz, accepted_at timestamptz, accepted_name text, paid_at timestamptz,
  stripe_session_id text, stripe_subscription_id text, stripe_mode text,
  reminders_sent int not null default 0, last_reminder_at timestamptz,
  pdf_sha256 text
);
alter table public.practice_quotes enable row level security;   -- server only
create or replace function public.next_practice_quote_number() returns text language sql as $$
  select 'A4T-Q-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.practice_quote_seq')::text, 4, '0');
$$;
select cron.schedule('practice-quote-reminders', '41 * * * *', $$
  select net.http_post(
    url := 'https://pmngappuatunbhodqipn.supabase.co/functions/v1/quote',
    headers := jsonb_build_object('Content-Type','application/json',
                                  'x-cron-secret', (select cron_secret from public.app_settings where id = 1)),
    body := '{"action":"reminders"}'::jsonb, timeout_milliseconds := 120000);
$$);
