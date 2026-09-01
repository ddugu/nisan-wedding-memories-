import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin-auth";
import { config } from "@/lib/config";

export const runtime = "nodejs";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminUser(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: memory, error: fetchError } = await admin
      .from("memories")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    if (memory.status === "deleted") {
      return NextResponse.json({ error: "Already deleted" }, { status: 410 });
    }

    const { data: memoryPhotos } = await admin.storage
      .from(config.memoryPhotosBucket)
      .list(memory.id);

    if (memoryPhotos?.length) {
      const photoPaths = memoryPhotos.map((file) => `${memory.id}/${file.name}`);
      const { error: memoryPhotosError } = await admin.storage
        .from(config.memoryPhotosBucket)
        .remove(photoPaths);
      if (memoryPhotosError) {
        console.error("Memory photos delete error:", memoryPhotosError);
      }
    }

    if (memory.image_path) {
      const { error: storageError } = await admin.storage
        .from(config.storageBucket)
        .remove([memory.image_path]);
      if (storageError) {
        console.error("Storage delete error:", storageError);
      }
    }

    const { error: deleteError } = await admin
      .from("memories")
      .update({ status: "deleted" })
      .eq("id", id);

    if (deleteError) {
      console.error("DB delete error:", deleteError);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    await admin.rpc("release_storage_space", {
      released_size: memory.file_size,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
