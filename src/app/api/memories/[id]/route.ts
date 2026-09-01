import { NextRequest, NextResponse } from "next/server";
import { deleteMemoryById } from "@/lib/memoryService";
import { MemoryPipelineError } from "@/lib/supabase/env";

export const runtime = "nodejs";

const USER_ERROR = "Anı silinemedi. Lütfen tekrar deneyin. ♡";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteMemoryById(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MemoryPipelineError && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Anı bulunamadı." }, { status: 404 });
    }

    console.error("Delete memory error:", error);
    return NextResponse.json({ error: USER_ERROR }, { status: 500 });
  }
}
