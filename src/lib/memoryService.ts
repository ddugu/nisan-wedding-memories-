import { createAdminClient } from "@/lib/supabase/admin";
import { config, getMaxTotalStorageBytes } from "@/lib/config";
import {
  validateFileSize,
  validateMagicBytes,
  createMemoryFormSchema,
  resolveImageMimeType,
  type AllowedMimeType,
} from "@/lib/validation";
import { hashIP } from "@/lib/hash";
import { getPublicImageUrl } from "@/lib/storage";
import { logSupabaseError, MemoryPipelineError } from "@/lib/supabase/env";

const PHOTOS_BUCKET = config.memoryPhotosBucket;

function photoExtension(mimeType: AllowedMimeType): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function generatePhotoPath(memoryId: string, mimeType: AllowedMimeType): string {
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
    if (sizeError) {
      throw new MemoryPipelineError("validation", sizeError, {
        fileName: file.name,
        fileSize: file.size,
      });
    }

    const buffer = await file.arrayBuffer();
    const mimeType = resolveImageMimeType(buffer, file.name, file.type);

    if (!mimeType || !validateMagicBytes(buffer, mimeType)) {
      console.error("[memories:photo-validation] rejected file", {
        fileName: file.name,
        declaredType: file.type || "(empty)",
        resolvedType: mimeType,
        fileSize: file.size,
      });
      throw new MemoryPipelineError("validation", "INVALID_FILE", {
        fileName: file.name,
        declaredType: file.type || "(empty)",
        resolvedType: mimeType,
      });
    }

    const storagePath = generatePhotoPath(memoryId, mimeType);
    const { error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(storagePath, buffer, { contentType: mimeType, upsert: false });

    if (error) {
      logSupabaseError("storage-upload", error);
      throw new MemoryPipelineError("storage-upload", "UPLOAD_FAILED", {
        bucket: PHOTOS_BUCKET,
        storagePath,
        contentType: mimeType,
        supabase: {
          name: error.name,
          message: error.message,
        },
      });
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
    logSupabaseError("db-insert", error);
    throw new MemoryPipelineError("db-insert", "UPLOAD_FAILED", {
      memoryId: opts.memoryId,
      photoCount: opts.photos.length,
      supabase: error
        ? { code: error.code, message: error.message, details: error.details, hint: error.hint }
        : null,
    });
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
    logSupabaseError("storage-reserve", error);
    throw new MemoryPipelineError("storage-reserve", "UPLOAD_FAILED", {
      totalSize,
      supabase: { code: error.code, message: error.message, details: error.details },
    });
  }

  return Boolean(data);
}

export async function releaseStorage(totalSize: number) {
  if (totalSize <= 0) return;
  const supabase = createAdminClient();
  await supabase.rpc("release_storage_space", { released_size: totalSize });
}

export async function deleteMemoryById(memoryId: string) {
  const supabase = createAdminClient();

  const { data: memory, error: fetchError } = await supabase
    .from("memories")
    .select("*")
    .eq("id", memoryId)
    .single();

  if (fetchError || !memory) {
    throw new MemoryPipelineError("db-delete", "NOT_FOUND", {
      memoryId,
      supabase: fetchError
        ? { code: fetchError.code, message: fetchError.message }
        : null,
    });
  }

  const { data: memoryPhotos } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .list(memoryId);

  if (memoryPhotos?.length) {
    const photoPaths = memoryPhotos.map((file) => `${memoryId}/${file.name}`);
    const { error: photosError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove(photoPaths);
    if (photosError) {
      logSupabaseError("storage-delete-memory-photos", photosError);
      throw new MemoryPipelineError("storage-delete", "DELETE_FAILED", {
        memoryId,
        bucket: PHOTOS_BUCKET,
      });
    }
  }

  if (memory.image_path) {
    for (const bucket of [PHOTOS_BUCKET, config.storageBucket]) {
      const { error } = await supabase.storage.from(bucket).remove([memory.image_path]);
      if (!error) break;
    }
  }

  const { error: deleteError } = await supabase
    .from("memories")
    .delete()
    .eq("id", memoryId);

  if (deleteError) {
    logSupabaseError("db-delete", deleteError);
    throw new MemoryPipelineError("db-delete", "DELETE_FAILED", {
      memoryId,
      supabase: {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
      },
    });
  }

  if (memory.file_size > 0) {
    await releaseStorage(memory.file_size);
  }

  return { success: true };
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
