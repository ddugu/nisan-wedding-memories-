-- Revoke public access to sensitive RPC functions
-- Only service_role (used in server API routes) may call these

REVOKE EXECUTE ON FUNCTION reserve_storage_space(BIGINT, BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION release_storage_space(BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION get_storage_usage() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION count_photos_by_uploader(TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION reserve_storage_space(BIGINT, BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION release_storage_space(BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION get_storage_usage() TO service_role;
GRANT EXECUTE ON FUNCTION count_photos_by_uploader(TEXT) TO service_role;

-- Prevent anon/authenticated from writing to memories or storage_stats
-- (RLS already blocks writes; these explicit revokes add defense in depth)
REVOKE INSERT, UPDATE, DELETE ON memories FROM anon, authenticated;
REVOKE ALL ON storage_stats FROM anon, authenticated;

-- Ensure public can only SELECT approved memories (re-create if needed)
DROP POLICY IF EXISTS "Public can view approved memories" ON memories;
CREATE POLICY "Public can view approved memories"
  ON memories FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Prevent storage writes from anon/authenticated
DROP POLICY IF EXISTS "Public read wedding memories" ON storage.objects;
CREATE POLICY "Public read wedding memories"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wedding-memories');
