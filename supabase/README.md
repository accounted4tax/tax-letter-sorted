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
