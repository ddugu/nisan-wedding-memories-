import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin-auth";
import { config, formatBytes, getMaxTotalStorageBytes } from "@/lib/config";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const [{ data: memories, error: memError }, { data: storageUsed, error: storageError }, { count }] =
      await Promise.all([
        admin
          .from("memories")
          .select("*")
          .neq("status", "deleted")
          .order("created_at", { ascending: false }),
        admin.rpc("get_storage_usage"),
        admin
          .from("memories")
          .select("*", { count: "exact", head: true })
          .neq("status", "deleted"),
      ]);

    if (memError || storageError) {
      console.error("Admin stats error:", memError || storageError);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    const totalUsedBytes = storageUsed ?? 0;
    const maxTotalBytes = getMaxTotalStorageBytes();

    return NextResponse.json({
      memories: memories ?? [],
      stats: {
        totalMemories: count ?? 0,
        totalUsedBytes,
        maxTotalBytes,
        remainingBytes: Math.max(0, maxTotalBytes - totalUsedBytes),
        totalUsedFormatted: formatBytes(totalUsedBytes),
        maxTotalFormatted: formatBytes(maxTotalBytes),
        remainingFormatted: formatBytes(Math.max(0, maxTotalBytes - totalUsedBytes)),
        maxFileSizeMB: config.maxFileSizeMB,
        maxPhotosPerGuest: config.maxPhotosPerGuest,
      },
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
