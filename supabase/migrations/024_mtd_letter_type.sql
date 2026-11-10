-- 024: new letter type "mtd-income-tax" (Making Tax Digital for Income Tax letters – Eduard 10 Nov 2026)
alter table public.cases drop constraint if exists cases_letter_type_check;
alter table public.cases add constraint cases_letter_type_check check (letter_type = any (array[
  'sa-late-filing-100','sa-late-filing-later','sa-late-payment','sa-notice-to-file','sa-other','sa-statement',
  'nudge-letters','mtd-income-tax','p800','simple-assessment',
  'vat-late-submission','vat-late-payment','vat-other','paye-employer-penalty','paye-other','cis-late-return',
  'ct-late-filing','ct-other','companies-house-late-filing','companies-house-strike-off','companies-house-other',
  'compliance-check','hmrc-other','not-recognised']));
