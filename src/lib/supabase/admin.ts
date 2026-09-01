import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
