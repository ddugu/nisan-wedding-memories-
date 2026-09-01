import { z } from "zod";
import { config, getMaxFileSizeBytes } from "./config";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MAGIC_BYTES: Record<AllowedMimeType, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

export function validateMagicBytes(
  buffer: ArrayBuffer,
  mimeType: AllowedMimeType
): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  const signatures = MAGIC_BYTES[mimeType];

  const matchesSignature = signatures.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  );

  if (!matchesSignature) return false;

  if (mimeType === "image/webp") {
    const webpMarker = [0x57, 0x45, 0x42, 0x50];
    return webpMarker.every((byte, i) => bytes[8 + i] === byte);
  }

  return true;
}

export function getExtensionFromMime(mimeType: AllowedMimeType): string {
  const map: Record<AllowedMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mimeType];
}

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

/** Detect MIME from file header bytes (most reliable). */
export function detectImageMimeFromBuffer(buffer: ArrayBuffer): AllowedMimeType | null {
  const bytes = new Uint8Array(buffer.slice(0, 12));

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }

  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    const webpMarker = [0x57, 0x45, 0x42, 0x50];
    if (webpMarker.every((byte, i) => bytes[8 + i] === byte)) {
      return "image/webp";
    }
  }

  return null;
}

function extensionToMime(ext: string): AllowedMimeType | null {
  const map: Record<string, AllowedMimeType> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return map[ext.toLowerCase()] ?? null;
}

/**
 * Resolve the true image MIME type for server-side uploads.
 * Prefers magic bytes, then declared browser type, then file extension.
 */
export function resolveImageMimeType(
  buffer: ArrayBuffer,
  filename: string,
  declaredType: string
): AllowedMimeType | null {
  const detected = detectImageMimeFromBuffer(buffer);
  if (detected) return detected;

  if (isAllowedMimeType(declaredType)) return declaredType;

  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext) return extensionToMime(ext);

  return null;
}

export const uploadFormSchema = z.object({
  guestName: z
    .string()
    .max(100, "İsim en fazla 100 karakter olabilir")
    .optional()
    .transform((v) => v?.trim() || undefined),
  message: z
    .string()
    .max(500, "Mesaj en fazla 500 karakter olabilir")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export const createMemoryFormSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(1, "Lütfen adınızı yazın.")
    .max(100, "İsim en fazla 100 karakter olabilir"),
  message: z
    .string()
    .trim()
    .min(1, "Lütfen anınızı yazın.")
    .max(500, "Mesaj en fazla 500 karakter olabilir"),
});

export function validateFileSize(size: number): string | null {
  const maxBytes = getMaxFileSizeBytes();
  if (size > maxBytes) {
    return `Fotoğraf çok büyük. Maksimum ${config.maxFileSizeMB} MB yükleyebilirsiniz.`;
  }
  if (size === 0) {
    return "Geçersiz dosya.";
  }
  return null;
}

export function validateFileExtension(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp"];
  return ext ? allowed.includes(ext) : false;
}
