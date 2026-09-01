import { createHash } from "crypto";

export function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT;

  if (!salt && process.env.NODE_ENV === "production") {
    throw new Error("IP_HASH_SALT must be set in production");
  }

  return createHash("sha256")
    .update(`${salt ?? "dev-only-salt"}:${ip}`)
    .digest("hex");
}
