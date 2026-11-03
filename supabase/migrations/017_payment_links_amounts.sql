-- 017_payment_links_amounts – applied 3 Nov 2026
-- Payment links Eduard sends after a call (£19 / £39 / £59, or a top-up of £20 / £40).
alter table public.payment_links
  add column if not exists amount_pence integer,
  add column if not exists target text check (target in ('option2','option3')),
  add column if not exists label text,
  add column if not exists sent_to text,
  add column if not exists created_by text;
alter table public.payments add column if not exists payment_link_id uuid references public.payment_links(id);
