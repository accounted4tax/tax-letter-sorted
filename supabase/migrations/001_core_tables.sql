-- Tax Letter Sorted – core tables (Week 3)
-- Every table has row level security ON and no public policies:
-- only server-side Edge Functions (service role) can read or write.

-- ---------- reference numbers ----------
create sequence if not exists public.case_ref_seq start 1;

-- ---------- customers (kept 6 years: name, contact, consent) ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  deleted_at timestamptz
);

-- ---------- cases ----------
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null default ('TLS-' || lpad(nextval('public.case_ref_seq')::text, 4, '0')),
  created_at timestamptz not null default now(),
  customer_id uuid references public.customers(id) on delete set null,
  language text not null default 'en' check (language in ('en','ro','pl','bg','lt','ar','ur')),
  letter_type text check (letter_type in (
    'sa-late-filing-100','sa-late-filing-later','sa-late-payment','sa-notice-to-file',
    'nudge-letters','p800','simple-assessment','ct-late-filing','companies-house-late-filing','not-recognised')),
  product text not null default 'option1' check (product in ('option1','option2','option3','call')),
  status text not null default 'uploaded' check (status in (
    'uploaded','explained','questions','outcome','callback_requested','awaiting_payment','paid',
    'awaiting_id','in_review','awaiting_signature','approved','sent','posted','closed','deleted')),
  outcome_route text check (outcome_route in ('appeal','choice','callback','not_accepted','hmrc_check_first','explain_only')),
  tax_year text,
  notice_date date,
  appeal_deadline date,
  penalty_amount numeric(10,2),
  private_token text unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  -- temporary personal data (deleted with the case files)
  address text,
  ni_number text,
  utr text,
  -- key timestamps
  health_consent_at timestamptz,
  facts_confirmed_at timestamptz,
  approved_at timestamptz,
  sent_at timestamptz,
  delete_after timestamptz,        -- Option 1: +24h; Option 2: sent_at + 14 days; call-back: +30 days; Option 3: null (kept)
  data_deleted_at timestamptz
);

-- ---------- questionnaire answers (temporary) ----------
create table if not exists public.case_answers (
  case_id uuid primary key references public.cases(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,       -- in the client's language
  answers_english jsonb,                            -- confirmed English version
  updated_at timestamptz not null default now()
);

-- ---------- files in storage (letters, evidence, ID, PDFs) ----------
create table if not exists public.case_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  kind text not null check (kind in ('letter','evidence','id_photo','id_address','appeal_pdf','signed_pdf')),
  storage_path text not null,
  sha256 text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- payments (kept 6 years) ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  product text not null check (product in ('option2','option3','call','option3_topup')),
  amount_pence integer not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text not null default 'pending' check (status in ('pending','paid','refunded','failed','expired')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ---------- payment links sent from admin (expire after 7 days) ----------
create table if not exists public.payment_links (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  product text not null check (product in ('option2','option3','option3_topup')),
  stripe_url text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz
);

-- ---------- email log (kept 6 years; PDF itself is not kept) ----------
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  recipient text not null,
  email_type text not null check (email_type in ('appeal_pdf','case_link','payment_link','id_request','ready_to_sign','posted','callback_confirm','help_confirm','other')),
  sent_at timestamptz not null default now(),
  provider_message_id text,
  status text not null default 'sent' check (status in ('sent','delivered','bounced','complaint','failed')),
  status_at timestamptz,
  pdf_sha256 text
);

-- ---------- call-backs ----------
create table if not exists public.callbacks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  reason_summary text,
  paid_call boolean not null default false,
  status text not null default 'new' check (status in ('new','called','link_sent','no_appeal','closed')),
  call_notes text,                  -- kept 6 years
  created_at timestamptz not null default now(),
  called_at timestamptz
);

-- ---------- help with tax return requests ----------
create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  tax_year text,
  note text,
  contact_consent_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','contacted','client','closed')),
  created_at timestamptz not null default now()
);

-- ---------- funnel (anonymous step counts, kept 24 months) ----------
create table if not exists public.funnel_events (
  id bigint generated always as identity primary key,
  visit_id uuid not null,
  step text not null check (step in (
    'home','uploaded','recognised','explanation','questions_started','questions_finished',
    'outcome','option_chosen','stripe_opened','paid','approved','downloaded','callback_requested','help_requested')),
  letter_type text,
  language text,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists funnel_events_created_idx on public.funnel_events (created_at);

-- ---------- audit log (who changed or deleted what) ----------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,              -- 'system', 'admin', 'stripe', 'brevo'
  action text not null,
  case_id uuid,
  detail jsonb
);

-- ---------- lock everything down ----------
alter table public.customers      enable row level security;
alter table public.cases          enable row level security;
alter table public.case_answers   enable row level security;
alter table public.case_files     enable row level security;
alter table public.payments       enable row level security;
alter table public.payment_links  enable row level security;
alter table public.email_log      enable row level security;
alter table public.callbacks      enable row level security;
alter table public.help_requests  enable row level security;
alter table public.funnel_events  enable row level security;
alter table public.audit_log      enable row level security;
