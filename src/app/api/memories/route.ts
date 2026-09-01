import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeMemory } from "@/lib/memory-normalize";
import type { MemoryWithThumbnail } from "@/lib/types";
import { getClientIP } from "@/lib/rate-limit";
import {
  cleanupUploadedPhotos,
  createMemoryRecord,
  hashClientIP,
  parseMemoryFormFields,
  releaseStorage,
  reserveStorageForPhotos,
  uploadMemoryPhotos,
} from "@/lib/memoryService";

export const runtime = "nodejs";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const MAX_PHOTOS = 5;
const USER_ERROR = "Anınızı şu anda kaydedemedik. Lütfen tekrar deneyin. ♡";
const INVALID_FILE = "Bu fotoğraf desteklenmeyen bir dosya formatında.";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );

    const supabase = createPublicClient();

    const { count: totalCount } = await supabase
      .from("memories")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    let query = supabase
      .from("memories")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Memories fetch error:", error);
      return NextResponse.json({ memories: [], nextCursor: null, hasMore: false, total: 0 });
    }

    const hasMore = (data?.length ?? 0) > limit;
    const memories = (data ?? []).slice(0, limit);

    const enriched: MemoryWithThumbnail[] = memories.map((m) =>
      normalizeMemory({
        ...m,
        status: m.status as MemoryWithThumbnail["status"],
        photos: Array.isArray(m.photos)
          ? m.photos.filter((p): p is string => typeof p === "string")
          : [],
      })
    );

    const nextCursor = hasMore && memories.length > 0
      ? memories[memories.length - 1].created_at
      : null;

    return NextResponse.json({
      memories: enriched,
      nextCursor,
      hasMore,
      total: totalCount ?? memories.length,
    });
  } catch (error) {
    console.error("Memories API error:", error);
    return NextResponse.json({ memories: [], nextCursor: null, hasMore: false, total: 0 });
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const ipHash = hashClientIP(clientIP);
  const memoryId = crypto.randomUUID();
  let uploadedPaths: string[] = [];
  let reservedSize = 0;
  let supabase: ReturnType<typeof createAdminClient> | null = null;

  try {
    const formData = await request.formData();
    const guestName = formData.get("guestName") as string | null;
    const message = formData.get("message") as string | null;

    const parsed = parseMemoryFormFields(guestName, message);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const files = formData
      .getAll("photos")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.` },
        { status: 400 }
      );
    }

    supabase = createAdminClient();

    if (files.length > 0) {
      reservedSize = files.reduce((sum, f) => sum + f.size, 0);
      const reserved = await reserveStorageForPhotos(supabase, reservedSize);
      if (!reserved) {
        return NextResponse.json(
          { error: "Anı albümümüz şimdilik doldu ♡ Biraz sonra tekrar deneyebilirsiniz." },
          { status: 507 }
        );
      }

      const uploaded = await uploadMemoryPhotos(memoryId, files, supabase);
      uploadedPaths = uploaded.paths;

      const memory = await createMemoryRecord({
        memoryId,
        guestName: parsed.data.guestName,
        message: parsed.data.message,
        photos: uploaded.urls,
        photoPaths: uploaded.paths,
        totalFileSize: uploaded.totalSize,
        ipHash,
      });

      return NextResponse.json({ success: true, memory });
    }

    const memory = await createMemoryRecord({
      memoryId,
      guestName: parsed.data.guestName,
      message: parsed.data.message,
      photos: [],
      photoPaths: [],
      totalFileSize: 0,
      ipHash,
    });

    return NextResponse.json({ success: true, memory });
  } catch (error) {
    console.error("Create memory error:", error);
    if (supabase && uploadedPaths.length > 0) {
      await cleanupUploadedPhotos(supabase, uploadedPaths);
    }
    if (reservedSize > 0) {
      await releaseStorage(reservedSize);
    }

    const message = error instanceof Error && error.message === "INVALID_FILE"
      ? INVALID_FILE
      : USER_ERROR;

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
