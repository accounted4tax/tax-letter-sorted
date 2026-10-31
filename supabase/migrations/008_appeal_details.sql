-- 008: client details for the appeal form (name, address, phone, company details).
-- Personal data: wiped by cleanup-expired with the rest of the case data
-- (14 days after the appeal is emailed for Option 2).
alter table public.cases add column if not exists details jsonb;
alter table public.cases add column if not exists details_saved_at timestamptz;
alter table public.cases add column if not exists pdf_built_at timestamptz;
comment on column public.cases.details is 'Name, address, postcode, phone, email, company name/number, role as entered for the appeal. Deleted with case data.';
