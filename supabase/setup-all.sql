-- =============================================================================
-- Nisan Wedding Memories — FULL Supabase setup
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query → Run
-- Order: 001 → 002 → 003 → 004 (already combined below)
-- =============================================================================

-- ========== 001_initial_schema.sql ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  guest_name TEXT,
  message TEXT,
  image_path TEXT NOT NULL,
  image_url TEXT,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
  uploader_ip_hash TEXT,
  CONSTRAINT message_length CHECK (char_length(message) <= 500),
  CONSTRAINT guest_name_length CHECK (char_length(guest_name) <= 100)
);

CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories (status);
CREATE INDEX IF NOT EXISTS idx_memories_uploader_ip ON memories (uploader_ip_hash);
CREATE INDEX IF NOT EXISTS idx_memories_status_created ON memories (status, created_at DESC);

CREATE TABLE IF NOT EXISTS storage_stats (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_used_bytes BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO storage_stats (id, total_used_bytes) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION reserve_storage_space(
  incoming_size BIGINT,
  max_total_bytes BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  updated_rows INT;
BEGIN
  UPDATE storage_stats
  SET
    total_used_bytes = total_used_bytes + incoming_size,
    updated_at = NOW()
  WHERE id = 1
    AND total_used_bytes + incoming_size <= max_total_bytes;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION release_storage_space(released_size BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE storage_stats
  SET
    total_used_bytes = GREATEST(0, total_used_bytes - released_size),
    updated_at = NOW()
  WHERE id = 1;
END;
$$;

CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT total_used_bytes FROM storage_stats WHERE id = 1;
$$;

CREATE OR REPLACE FUNCTION count_photos_by_uploader(ip_hash TEXT)
RETURNS INT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INT
  FROM memories
  WHERE uploader_ip_hash = ip_hash
    AND status != 'deleted';
$$;

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved memories" ON memories;
CREATE POLICY "Public can view approved memories"
  ON memories FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "No public access to storage_stats" ON storage_stats;
CREATE POLICY "No public access to storage_stats"
  ON storage_stats FOR ALL
  USING (false);

-- ========== 002_storage_bucket.sql ==========
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

DROP POLICY IF EXISTS "Public read wedding memories" ON storage.objects;
CREATE POLICY "Public read wedding memories"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-memories');

-- ========== 003_security_hardening.sql ==========
REVOKE EXECUTE ON FUNCTION reserve_storage_space(BIGINT, BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION release_storage_space(BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION get_storage_usage() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION count_photos_by_uploader(TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION reserve_storage_space(BIGINT, BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION release_storage_space(BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION get_storage_usage() TO service_role;
GRANT EXECUTE ON FUNCTION count_photos_by_uploader(TEXT) TO service_role;

REVOKE INSERT, UPDATE, DELETE ON memories FROM anon, authenticated;
REVOKE ALL ON storage_stats FROM anon, authenticated;

DROP POLICY IF EXISTS "Public can view approved memories" ON memories;
CREATE POLICY "Public can view approved memories"
  ON memories FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "Public read wedding memories" ON storage.objects;
CREATE POLICY "Public read wedding memories"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wedding-memories');

-- ========== 004_memory_photos_jsonb.sql ==========
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE memories
  ALTER COLUMN image_path DROP NOT NULL;

ALTER TABLE memories
  ALTER COLUMN file_size SET DEFAULT 0;

ALTER TABLE memories
  ALTER COLUMN mime_type DROP NOT NULL;

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
