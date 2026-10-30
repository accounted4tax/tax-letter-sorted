alter table public.cases add column if not exists letter_text text;          -- text layer of a digital PDF (temporary)
alter table public.cases add column if not exists extracted jsonb;            -- what was read from the letter (temporary)
alter table public.cases add column if not exists details_confirmed_at timestamptz;
alter table public.cases add column if not exists read_attempts int not null default 0;
