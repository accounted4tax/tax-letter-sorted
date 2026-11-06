-- 023: practice quotes – the year-ends the work is for: {"oneoff": "31 October 2025", "yearend": "2026-10-31"}
alter table public.practice_quotes add column if not exists periods jsonb not null default '{}'::jsonb;
