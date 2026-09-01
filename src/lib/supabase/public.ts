import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let publicClient: ReturnType<typeof createClient<Database>> | null = null;

/** Read-only Supabase client using anon key — respects RLS policies. */
export function createPublicClient() {
  if (!publicClient) {
    publicClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return publicClient;
}
