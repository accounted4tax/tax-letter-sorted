-- Wider letter coverage: VAT, PAYE, Corporation Tax, Companies House and other HMRC letters (explain-all)
alter table public.cases drop constraint if exists cases_letter_type_check;
alter table public.cases add constraint cases_letter_type_check check (letter_type in (
  'sa-late-filing-100','sa-late-filing-later','sa-late-payment','sa-notice-to-file','sa-other',
  'nudge-letters','p800','simple-assessment',
  'vat-late-submission','vat-late-payment','vat-other',
  'paye-employer-penalty','paye-other',
  'ct-late-filing','ct-other',
  'companies-house-late-filing','companies-house-other',
  'compliance-check','hmrc-other','not-recognised'));
