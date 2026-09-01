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
