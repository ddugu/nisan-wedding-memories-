import { createHash } from "crypto";
import { getIpHashSalt } from "@/lib/supabase/env";

export function hashIP(ip: string): string {
  const salt = getIpHashSalt();

  if (!salt && process.env.NODE_ENV === "production") {
    throw new Error("IP_HASH_SALT must be set in production");
  }

  return createHash("sha256")
    .update(`${salt ?? "dev-only-salt"}:${ip}`)
    .digest("hex");
}
