import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin-auth";
import { deleteMemoryById } from "@/lib/memoryService";

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

    await deleteMemoryById(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
