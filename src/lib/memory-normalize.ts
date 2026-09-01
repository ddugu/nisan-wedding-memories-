import { getPublicImageUrl, getThumbnailUrl } from "./storage";
import { config } from "./config";
import type { Memory, MemoryWithThumbnail } from "./types";

export function getMemoryPhotoUrls(memory: Memory): string[] {
  const jsonPhotos = Array.isArray(memory.photos)
    ? memory.photos.filter((p): p is string => typeof p === "string" && p.length > 0)
    : [];

  if (jsonPhotos.length > 0) return jsonPhotos;

  if (memory.image_url) return [memory.image_url];
  if (memory.image_path) {
    const memoryPhotosUrl = getPublicImageUrl(memory.image_path, config.memoryPhotosBucket);
    if (memoryPhotosUrl) return [memoryPhotosUrl];
    return [getPublicImageUrl(memory.image_path)];
  }

  return [];
}

export function normalizeMemory(memory: Memory): MemoryWithThumbnail {
  const photos = getMemoryPhotoUrls(memory);
  const thumbnail_url =
    photos[0] ??
    ((memory.image_path ? getPublicImageUrl(memory.image_path, config.memoryPhotosBucket) : "") ||
      (memory.image_path ? getThumbnailUrl(memory.image_path, 600) : ""));

  return {
    ...memory,
    photos,
    thumbnail_url,
  };
}

export interface GalleryPhotoItem {
  id: string;
  url: string;
  thumbnail_url: string;
  guest_name: string | null;
  memory_id: string;
  created_at: string;
}

export function flattenMemoriesToGalleryPhotos(memories: MemoryWithThumbnail[]): GalleryPhotoItem[] {
  const items: GalleryPhotoItem[] = [];

  for (const memory of memories) {
    const urls = memory.photos.length > 0 ? memory.photos : [];
    urls.forEach((url, i) => {
      items.push({
        id: `${memory.id}-${i}`,
        url,
        thumbnail_url: url,
        guest_name: memory.guest_name,
        memory_id: memory.id,
        created_at: memory.created_at,
      });
    });
  }

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
