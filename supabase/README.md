# Supabase

`migrations/` holds every database change, in order. Each file is run once in the Supabase SQL Editor
(or deployed automatically later). Never put keys or passwords in these files.

Applied to project tax-letter-sorted (pmngappuatunbhodqipn):
- 001_core_tables.sql – 30 Oct 2026 (run by Eduard in the SQL Editor)
- 002_private_storage.sql – 30 Oct 2026 (applied by Claude via the Supabase connector)
- 003_app_settings.sql – 30 Oct 2026 (Claude). Live switch, preview code and allowed websites.
- 004_cleanup_schedule.sql – 30 Oct 2026 (Claude). Hourly retention clean-up (pg_cron at :07 → cleanup-expired). Tested: 3 test cases deleted.

Edge functions: upload-letter, cleanup-expired (source in functions/).
- 005_letter_reading.sql – 30 Oct 2026 (Claude). Temporary letter_text / extracted columns (cleared by the clean-up job).
- 006_move_pg_net.sql – 31 Oct 2026 (Claude, approved by Eduard). Security advisor warning cleared.

Edge functions now: upload-letter (v2), cleanup-expired (v2), read-letter (v1 – needs the ANTHROPIC_API_KEY secret).
- 007_more_letter_types.sql – 31 Oct 2026 (Claude). 20 letter types: VAT, PAYE, CT, Companies House, compliance check, other HMRC. Checked in pg_constraint.
- 008_appeal_details.sql – applied 31 Oct 2026 (cases.details, details_saved_at, pdf_built_at)
- 009_payments_test – applied 31 Oct 2026 (app_settings.payments_test, payments.stripe_mode)

Edge functions (31 Oct 2026): appeal v3, payments v1, cleanup-expired v6, case-flow v1, read-letter v4, upload-letter v2.
Secrets set by Eduard in the dashboard: ANTHROPIC_API_KEY, STRIPE_SECRET_KEY (sandbox), BREVO_API_KEY (send-only).
- 010_id_documents – applied 31 Oct 2026 (ID document kinds, doc_type, id_requested_at, id_reminders_sent, id_completed_at, authority_to_act_at)
- 011_id_reminders_schedule – pg_cron 'id-reminders-10min' calls id-reminders every 10 minutes
Edge functions added 31 Oct 2026: id-docs v1, id-reminders v1; read-letter v7 (address_on_letter).
- 012_review_contacts – applied 1 Nov 2026 (company £39 reviews: phone/email preference and call availability)
Edge function added 1 Nov 2026: review-contact v1 (saves the preference, emails letters@ an alert).
- 013_company_agent_service – applied 1 Nov 2026 (company £59: authority_name/version, hmrc_code + dates; email types hmrc_code_request, appeal_ready; statuses awaiting_hmrc_code, submitted)
- 014_admin – applied 1 Nov 2026 (app_settings.admin_emails, cases.admin_appeal_text / admin_notes, help_requests.admin_notes)
Edge functions 1 Nov 2026: payments v2 (£59 for companies), id-docs v3 (authority to act, HMRC code, code email), appeal v4 (admin build/send, emails the approved PDF), admin v1 (admin page).
Admin sign-in: Supabase Auth email + password; the user must be created in the dashboard (Authentication → Users → Add user) with an email listed in app_settings.admin_emails.
