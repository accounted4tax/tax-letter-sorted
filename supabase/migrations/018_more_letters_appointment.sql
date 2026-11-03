-- 018: new letter types (SA statement / debt letters, CIS late return) and the £59 appointment product.
alter table cases drop constraint if exists cases_letter_type_check;
alter table cases add constraint cases_letter_type_check check (letter_type = any (array[
  'sa-late-filing-100','sa-late-filing-later','sa-late-payment','sa-notice-to-file','sa-other','sa-statement',
  'nudge-letters','p800','simple-assessment','vat-late-submission','vat-late-payment','vat-other',
  'paye-employer-penalty','paye-other','cis-late-return','ct-late-filing','ct-other',
  'companies-house-late-filing','companies-house-other','compliance-check','hmrc-other','not-recognised']));
alter table cases drop constraint if exists cases_product_check;
alter table cases add constraint cases_product_check check (product = any (array['option1','option2','option3','call','appointment']));
alter table payments drop constraint if exists payments_product_check;
alter table payments add constraint payments_product_check check (product = any (array['option2','option3','call','option3_topup','appointment']));
