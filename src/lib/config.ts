function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePositiveFloat(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  maxFileSizeMB: parsePositiveInt(process.env.MAX_FILE_SIZE_MB, 10),
  maxTotalStorageGB: parsePositiveFloat(process.env.MAX_TOTAL_STORAGE_GB, 0.9),
  maxPhotosPerGuest: parsePositiveInt(process.env.MAX_PHOTOS_PER_GUEST, 15),
  rateLimitUploadsPerHour: parsePositiveInt(process.env.RATE_LIMIT_UPLOADS_PER_HOUR, 5),
  weddingDate: process.env.NEXT_PUBLIC_WEDDING_DATE ?? "2026-09-02",
  storageBucket: "wedding-memories",
  memoryPhotosBucket: "memory-photos",
} as const;

export function getMaxFileSizeBytes(): number {
  return config.maxFileSizeMB * 1024 * 1024;
}

export function getMaxTotalStorageBytes(): number {
  return Math.floor(config.maxTotalStorageGB * 1024 * 1024 * 1024);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
}
