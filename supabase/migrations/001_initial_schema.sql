-- Wedding Memories Database Schema
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Memories table (metadata only — images stored in Supabase Storage)
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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories (status);
CREATE INDEX IF NOT EXISTS idx_memories_uploader_ip ON memories (uploader_ip_hash);
CREATE INDEX IF NOT EXISTS idx_memories_status_created ON memories (status, created_at DESC);

-- Atomic storage tracking table (prevents race conditions)
CREATE TABLE IF NOT EXISTS storage_stats (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_used_bytes BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO storage_stats (id, total_used_bytes) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Function: atomically reserve storage space
-- Returns true if reservation succeeded, false if limit would be exceeded
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

-- Function: release storage space (on delete or failed upload cleanup)
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

-- Function: get current storage usage
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT total_used_bytes FROM storage_stats WHERE id = 1;
$$;

-- Function: count photos by uploader IP hash
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

-- Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_stats ENABLE ROW LEVEL SECURITY;

-- Public can read approved memories
CREATE POLICY "Public can view approved memories"
  ON memories FOR SELECT
  USING (status = 'approved');

-- Service role bypasses RLS (used in API routes)
-- No public insert/update/delete policies — all writes go through API with service role

-- Storage stats: no public access
CREATE POLICY "No public access to storage_stats"
  ON storage_stats FOR ALL
  USING (false);

-- ============================================
-- STORAGE BUCKET SETUP (run in Supabase Dashboard or via API)
-- ============================================
-- Bucket name: wedding-memories
-- Public: true (for reading approved images)
-- File size limit: match MAX_FILE_SIZE_MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Storage policies:
-- 1. Public SELECT on wedding-memories bucket
-- 2. INSERT/UPDATE/DELETE only via service role (no anon policies for write)

-- Example storage policies (run in SQL editor):
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-memories',
  'wedding-memories',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-memories');

-- Writes handled via service role only (no anon insert policy)
*/
