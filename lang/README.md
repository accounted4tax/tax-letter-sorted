# Language files

One file per language. Every piece of on-screen text has a key (e.g. `upload.title`); the app looks up the key in the visitor's language.

| File | Language | Status |
|---|---|---|
| en.json | English | Source – authoritative |
| ro.json | Română | Reviewed by Eduard, 29 Oct 2026 |

Rules:
- `{name}` placeholders are filled in by the app (dates, amounts, links) – keep them exactly as they are.
- The `glossary` section keeps the English term in brackets after the translated term.
- Appeal forms and letters to HMRC are always generated in English.
- Later languages (Polish, Bulgarian, Lithuanian, then Arabic and Urdu) are added as new files with the same keys; right-to-left languages set `"direction": "rtl"` in `_meta`.
