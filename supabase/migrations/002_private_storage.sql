-- Private file storage (no public access; only server functions can read or write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('letters',  'letters',  false, 10485760, array['application/pdf','image/jpeg','image/png','image/heic','image/webp']),
  ('evidence', 'evidence', false, 10485760, array['application/pdf','image/jpeg','image/png','image/heic','image/webp']),
  ('id-docs',  'id-docs',  false, 10485760, array['application/pdf','image/jpeg','image/png','image/heic','image/webp']),
  ('appeals',  'appeals',  false, 5242880,  array['application/pdf'])
on conflict (id) do nothing;
