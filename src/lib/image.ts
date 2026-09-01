import imageCompression from "browser-image-compression";
import { ALLOWED_MIME_TYPES, type AllowedMimeType } from "./validation";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") {
    return file;
  }

  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  let inputFile = file;

  if (isHeic) {
    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.85,
      });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      inputFile = new File(
        [blob as Blob],
        file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"),
        { type: "image/jpeg" }
      );
    } catch {
      throw new Error(
        "HEIC formatı desteklenmiyor. Lütfen JPEG veya PNG formatında bir fotoğraf seçin."
      );
    }
  }

  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(inputFile.type)) {
    throw new Error("Sadece JPEG, PNG ve WebP formatları desteklenir.");
  }

  if (inputFile.size <= 500 * 1024) {
    return inputFile;
  }

  try {
    const compressed = await imageCompression(inputFile, COMPRESSION_OPTIONS);
    return compressed;
  } catch {
    return inputFile;
  }
}

export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

export function getOutputMimeType(file: File): AllowedMimeType {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}
