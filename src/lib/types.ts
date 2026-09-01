export type MemoryStatus = "pending" | "approved" | "rejected" | "deleted";

export interface Memory {
  id: string;
  created_at: string;
  guest_name: string | null;
  message: string | null;
  image_path: string | null;
  image_url: string | null;
  file_size: number;
  mime_type: string | null;
  status: MemoryStatus;
  photos?: string[];
}

export interface MemoryWithThumbnail extends Memory {
  thumbnail_url: string;
  photos: string[];
}

export interface UploadResult {
  success: boolean;
  memory?: Memory;
  error?: string;
  errorCode?: string;
}

export interface StorageStats {
  totalUsedBytes: number;
  maxTotalBytes: number;
  totalMemories: number;
  remainingBytes: number;
}

export interface MemoriesResponse {
  memories: MemoryWithThumbnail[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}
