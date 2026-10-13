import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import CloudinaryService from "@/services/cloudinaryService";

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { file, folder } = await req.json();

    if (!file) {
      return NextResponse.json({ error: "File data is required" }, { status: 400 });
    }

    const result = await CloudinaryService.uploadMedia(file, folder || "nextone_media");
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error uploading file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
