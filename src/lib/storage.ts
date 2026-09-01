import { config } from "./config";
import { getSupabaseUrl } from "./supabase/env";

export function getPublicImageUrl(
  imagePath: string,
  bucket: string = config.storageBucket
): string {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return "";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${imagePath}`;
}

export function getThumbnailUrl(imagePath: string, width = 600): string {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return "";
  return `${supabaseUrl}/storage/v1/render/image/public/${config.storageBucket}/${imagePath}?width=${width}&quality=80`;
}

export function generateStoragePath(mimeType: string): string {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const date = new Date();
  const datePrefix = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  const uuid = crypto.randomUUID();
  return `${datePrefix}/${uuid}.${ext}`;
}
