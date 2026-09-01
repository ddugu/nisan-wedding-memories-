import { createAdminClient } from "@/lib/supabase/admin";
import { config, getMaxTotalStorageBytes } from "@/lib/config";
import {
  validateFileSize,
  validateFileExtension,
  validateMagicBytes,
  isAllowedMimeType,
  createMemoryFormSchema,
} from "@/lib/validation";
import { hashIP } from "@/lib/hash";
import { getPublicImageUrl } from "@/lib/storage";

const PHOTOS_BUCKET = config.memoryPhotosBucket;

function photoExtension(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function generatePhotoPath(memoryId: string, mimeType: string): string {
  return `${memoryId}/${crypto.randomUUID()}.${photoExtension(mimeType)}`;
}

export async function uploadMemoryPhotos(
  memoryId: string,
  files: File[],
  supabase: ReturnType<typeof createAdminClient>
): Promise<{ urls: string[]; totalSize: number; paths: string[] }> {
  const urls: string[] = [];
  const paths: string[] = [];
  let totalSize = 0;

  for (const file of files) {
    const sizeError = validateFileSize(file.size);
    if (sizeError) throw new Error(sizeError);

    if (!validateFileExtension(file.name) || !isAllowedMimeType(file.type)) {
      throw new Error("INVALID_FILE");
    }

    const buffer = await file.arrayBuffer();
    if (!validateMagicBytes(buffer, file.type)) {
      throw new Error("INVALID_FILE");
    }

    const storagePath = generatePhotoPath(memoryId, file.type);
    const { error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Photo upload error:", error);
      throw new Error("UPLOAD_FAILED");
    }

    paths.push(storagePath);
    urls.push(getPublicImageUrl(storagePath, PHOTOS_BUCKET));
    totalSize += file.size;
  }

  return { urls, totalSize, paths };
}

export async function cleanupUploadedPhotos(
  supabase: ReturnType<typeof createAdminClient>,
  paths: string[]
) {
  if (paths.length === 0) return;
  await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
}

export async function createMemoryRecord(opts: {
  memoryId: string;
  guestName: string;
  message: string;
  photos: string[];
  photoPaths: string[];
  totalFileSize: number;
  ipHash: string;
}) {
  const supabase = createAdminClient();
  const firstPath = opts.photoPaths[0] ?? null;
  const firstUrl = opts.photos[0] ?? null;
  const mimeType = opts.photos.length > 0 ? "image/jpeg" : null;

  const { data, error } = await supabase
    .from("memories")
    .insert({
      id: opts.memoryId,
      guest_name: opts.guestName,
      message: opts.message,
      photos: opts.photos,
      image_path: firstPath,
      image_url: firstUrl,
      file_size: opts.totalFileSize,
      mime_type: mimeType,
      status: "approved",
      uploader_ip_hash: opts.ipHash,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Memory insert error:", error);
    throw new Error("UPLOAD_FAILED");
  }

  return data;
}

export async function reserveStorageForPhotos(
  supabase: ReturnType<typeof createAdminClient>,
  totalSize: number
): Promise<boolean> {
  if (totalSize <= 0) return true;

  const { data, error } = await supabase.rpc("reserve_storage_space", {
    incoming_size: totalSize,
    max_total_bytes: getMaxTotalStorageBytes(),
  });

  if (error) {
    console.error("Storage reserve error:", error);
    throw new Error("UPLOAD_FAILED");
  }

  return Boolean(data);
}

export async function releaseStorage(totalSize: number) {
  if (totalSize <= 0) return;
  const supabase = createAdminClient();
  await supabase.rpc("release_storage_space", { released_size: totalSize });
}

export function parseMemoryFormFields(guestName: string | null, message: string | null) {
  return createMemoryFormSchema.safeParse({
    guestName: guestName ?? "",
    message: message ?? "",
  });
}

export function hashClientIP(ip: string) {
  return hashIP(ip);
}

export { PHOTOS_BUCKET };
