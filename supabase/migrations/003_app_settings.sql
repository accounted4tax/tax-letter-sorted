-- One-row settings table read only by server functions.
-- live = false: uploads only accepted with the private preview code (kept in the database, not in this file).
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  live boolean not null default false,
  preview_code text,
  allowed_origins text[] not null default array['https://accounted4tax.github.io','https://taxlettersorted.accounted4tax.co.uk'],
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
insert into public.app_settings (id, live, preview_code) values (1, false, '<set privately>')
on conflict (id) do nothing;
