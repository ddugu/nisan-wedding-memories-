import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

let publicClient: ReturnType<typeof createClient<Database>> | null = null;

/** Read-only Supabase client using anon key — respects RLS policies. */
export function createPublicClient() {
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!publicClient && supabaseUrl && anonKey) {
    publicClient = createClient<Database>(supabaseUrl, anonKey);
  }

  if (!publicClient) {
    throw new Error("Supabase public client is not configured");
  }

  return publicClient;
}
