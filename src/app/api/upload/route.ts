import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { config, getMaxTotalStorageBytes } from "@/lib/config";
import {
  uploadFormSchema,
  validateFileSize,
  validateFileExtension,
  validateMagicBytes,
  isAllowedMimeType,
} from "@/lib/validation";
import { getClientIP } from "@/lib/rate-limit";
import { hashIP } from "@/lib/hash";
import { generateStoragePath, getPublicImageUrl } from "@/lib/storage";

export const runtime = "nodejs";

const ERROR_MESSAGES: Record<string, string> = {
  STORAGE_FULL: "Anı albümümüz şimdilik doldu ♡ Biraz sonra tekrar deneyebilirsiniz.",
  RATE_LIMIT: "Çok fazla yükleme yaptınız. Lütfen bir süre bekleyin.",
  GUEST_LIMIT: "Bu cihazdan yükleme limitine ulaştınız ♡",
  INVALID_FILE: "Geçersiz dosya formatı. Lütfen JPEG, PNG veya WebP seçin.",
  FILE_TOO_LARGE: `Fotoğraf çok büyük. Maksimum ${config.maxFileSizeMB} MB.`,
  UPLOAD_FAILED: "Yükleme sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
  NO_FILE: "Lütfen bir fotoğraf seçin.",
};

const HOUR_MS = 60 * 60 * 1000;

async function cleanupFailedUpload(
  supabase: ReturnType<typeof createAdminClient>,
  opts: { storagePath: string | null; fileSize: number; storageReserved: boolean }
) {
  if (opts.storagePath) {
    await supabase.storage.from(config.storageBucket).remove([opts.storagePath]);
  }
  if (opts.storageReserved) {
    await supabase.rpc("release_storage_space", { released_size: opts.fileSize });
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const ipHash = hashIP(clientIP);

  let fileSize = 0;
  let storageReserved = false;
  let storagePath: string | null = null;
  let supabase: ReturnType<typeof createAdminClient> | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const guestName = formData.get("guestName") as string | null;
    const message = formData.get("message") as string | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_FILE, errorCode: "NO_FILE" },
        { status: 400 }
      );
    }

    fileSize = file.size;

    const formValidation = uploadFormSchema.safeParse({
      guestName: guestName ?? undefined,
      message: message ?? undefined,
    });

    if (!formValidation.success) {
      return NextResponse.json(
        { error: formValidation.error.issues[0].message, errorCode: "VALIDATION" },
        { status: 400 }
      );
    }

    const sizeError = validateFileSize(fileSize);
    if (sizeError) {
      return NextResponse.json(
        { error: sizeError, errorCode: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    if (!validateFileExtension(file.name)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_FILE, errorCode: "INVALID_FILE" },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    if (!isAllowedMimeType(mimeType)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_FILE, errorCode: "INVALID_FILE" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    if (!validateMagicBytes(buffer, mimeType)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_FILE, errorCode: "INVALID_FILE" },
        { status: 400 }
      );
    }

    supabase = createAdminClient();

    const oneHourAgo = new Date(Date.now() - HOUR_MS).toISOString();
    const { count: recentUploads, error: rateError } = await supabase
      .from("memories")
      .select("*", { count: "exact", head: true })
      .eq("uploader_ip_hash", ipHash)
      .gte("created_at", oneHourAgo)
      .neq("status", "deleted");

    if (rateError) {
      console.error("Rate limit check error:", rateError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD_FAILED, errorCode: "UPLOAD_FAILED" },
        { status: 500 }
      );
    }

    if ((recentUploads ?? 0) >= config.rateLimitUploadsPerHour) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMIT, errorCode: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    const { data: guestCount, error: countError } = await supabase.rpc(
      "count_photos_by_uploader",
      { ip_hash: ipHash }
    );

    if (countError) {
      console.error("Guest count error:", countError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD_FAILED, errorCode: "UPLOAD_FAILED" },
        { status: 500 }
      );
    }

    if (guestCount >= config.maxPhotosPerGuest) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.GUEST_LIMIT, errorCode: "GUEST_LIMIT" },
        { status: 403 }
      );
    }

    const { data: reserved, error: reserveError } = await supabase.rpc(
      "reserve_storage_space",
      {
        incoming_size: fileSize,
        max_total_bytes: getMaxTotalStorageBytes(),
      }
    );

    if (reserveError) {
      console.error("Storage reserve error:", reserveError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD_FAILED, errorCode: "UPLOAD_FAILED" },
        { status: 500 }
      );
    }

    if (!reserved) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.STORAGE_FULL, errorCode: "STORAGE_FULL" },
        { status: 507 }
      );
    }

    storageReserved = true;

    storagePath = generateStoragePath(mimeType);
    const { error: uploadError } = await supabase.storage
      .from(config.storageBucket)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      await cleanupFailedUpload(supabase, { storagePath, fileSize, storageReserved });
      storageReserved = false;
      storagePath = null;
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD_FAILED, errorCode: "UPLOAD_FAILED" },
        { status: 500 }
      );
    }

    const imageUrl = getPublicImageUrl(storagePath);
    const { data: memory, error: insertError } = await supabase
      .from("memories")
      .insert({
        guest_name: formValidation.data.guestName ?? null,
        message: formValidation.data.message ?? null,
        image_path: storagePath,
        image_url: imageUrl,
        file_size: fileSize,
        mime_type: mimeType,
        status: "approved",
        uploader_ip_hash: ipHash,
      })
      .select()
      .single();

    if (insertError || !memory) {
      console.error("DB insert error:", insertError);
      await cleanupFailedUpload(supabase, { storagePath, fileSize, storageReserved });
      storageReserved = false;
      storagePath = null;
      return NextResponse.json(
        { error: ERROR_MESSAGES.UPLOAD_FAILED, errorCode: "UPLOAD_FAILED" },
        { status: 500 }
      );
    }

    storageReserved = false;
    storagePath = null;

    return NextResponse.json({
      success: true,
      memory: {
        id: memory.id,
        created_at: memory.created_at,
        guest_name: memory.guest_name,
        message: memory.message,
        image_url: memory.image_url,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (supabase) {
      await cleanupFailedUpload(supabase, { storagePath, fileSize, storageReserved });
    }
    return NextResponse.json(
      { error: ERROR_MESSAGES.UPLOAD_FAILED, errorCode: "UPLOAD_FAILED" },
      { status: 500 }
    );
  }
}
