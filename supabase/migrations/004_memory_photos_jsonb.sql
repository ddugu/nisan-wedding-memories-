-- Multi-photo memories: optional photos JSON array, text-only entries allowed

ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE memories
  ALTER COLUMN image_path DROP NOT NULL;

ALTER TABLE memories
  ALTER COLUMN file_size SET DEFAULT 0;

ALTER TABLE memories
  ALTER COLUMN mime_type DROP NOT NULL;

-- memory-photos storage bucket (new uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memory-photos',
  'memory-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Public read memory photos" ON storage.objects;
CREATE POLICY "Public read memory photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memory-photos');
