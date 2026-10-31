# Allowed values (checked from pg_constraint, 30 Oct 2026)

Dropdowns and code must use exactly these values. Re-run the pg_constraint check before changing any of them.

| Table.column | Allowed values |
|---|---|
| cases.language | en, ro, pl, bg, lt, ar, ur |
| cases.letter_type | sa-late-filing-100, sa-late-filing-later, sa-late-payment, sa-notice-to-file, sa-other, nudge-letters, p800, simple-assessment, vat-late-submission, vat-late-payment, vat-other, paye-employer-penalty, paye-other, ct-late-filing, ct-other, companies-house-late-filing, companies-house-other, compliance-check, hmrc-other, not-recognised (re-checked 31 Oct 2026) |
| cases.product | option1, option2, option3, call |
| cases.status | uploaded, explained, questions, outcome, callback_requested, awaiting_payment, paid, awaiting_id, in_review, awaiting_signature, approved, sent, posted, closed, deleted |
| cases.outcome_route | appeal, choice, callback, not_accepted, hmrc_check_first, explain_only |
| case_files.kind | letter, evidence, id_photo, id_address, appeal_pdf, signed_pdf |
| payments.product | option2, option3, call, option3_topup |
| payments.status | pending, paid, refunded, failed, expired |
| payment_links.product | option2, option3, option3_topup |
| email_log.email_type | appeal_pdf, case_link, payment_link, id_request, ready_to_sign, posted, callback_confirm, help_confirm, other |
| email_log.status | sent, delivered, bounced, complaint, failed |
| callbacks.status | new, called, link_sent, no_appeal, closed |
| help_requests.status | new, contacted, client, closed |
| funnel_events.step | home, uploaded, recognised, explanation, questions_started, questions_finished, outcome, option_chosen, stripe_opened, paid, approved, downloaded, callback_requested, help_requested |

Storage buckets (all private): letters, evidence, id-docs (10 MB), appeals (5 MB, PDF only).
