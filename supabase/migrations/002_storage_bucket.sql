-- Storage bucket and policies
-- Run after 001_initial_schema.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-memories',
  'wedding-memories',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Public read access for wedding photos
CREATE POLICY "Public read wedding memories"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-memories');

-- No public write — all uploads go through API with service role
