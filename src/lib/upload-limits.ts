import type { createAdminClient } from "@/lib/supabase/admin";
import { config } from "@/lib/config";

const HOUR_MS = 60 * 60 * 1000;

export type UploadLimitCode = "RATE_LIMIT" | "GUEST_LIMIT";

export const UPLOAD_LIMIT_MESSAGES: Record<UploadLimitCode, string> = {
  RATE_LIMIT: "Çok fazla yükleme yaptınız. Lütfen bir süre bekleyin.",
  GUEST_LIMIT: "Bu cihazdan fotoğraf yükleme limitine ulaştınız ♡",
};

function countPhotosInRow(row: { photos: unknown; image_path: string | null }): number {
  if (Array.isArray(row.photos) && row.photos.length > 0) {
    return row.photos.filter((p): p is string => typeof p === "string").length;
  }
  return row.image_path ? 1 : 0;
}

export async function checkUploadLimits(
  supabase: ReturnType<typeof createAdminClient>,
  ipHash: string,
  incomingPhotoCount: number
): Promise<{ ok: true } | { ok: false; code: UploadLimitCode }> {
  const oneHourAgo = new Date(Date.now() - HOUR_MS).toISOString();

  const { count: recentSubmissions, error: rateError } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true })
    .eq("uploader_ip_hash", ipHash)
    .gte("created_at", oneHourAgo)
    .neq("status", "deleted");

  if (rateError) throw rateError;

  if ((recentSubmissions ?? 0) >= config.rateLimitUploadsPerHour) {
    return { ok: false, code: "RATE_LIMIT" };
  }

  if (incomingPhotoCount <= 0) {
    return { ok: true };
  }

  const { data: existing, error: countError } = await supabase
    .from("memories")
    .select("photos, image_path")
    .eq("uploader_ip_hash", ipHash)
    .neq("status", "deleted");

  if (countError) throw countError;

  const existingPhotos = (existing ?? []).reduce(
    (sum, row) => sum + countPhotosInRow(row),
    0
  );

  if (existingPhotos + incomingPhotoCount > config.maxPhotosPerGuest) {
    return { ok: false, code: "GUEST_LIMIT" };
  }

  return { ok: true };
}
