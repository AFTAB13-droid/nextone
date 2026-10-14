import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TargetService from "@/services/targetService";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Comment text cannot be empty" }, { status: 400 });
    }

    const updated = await TargetService.addComment(actor, params.id, message);
    return NextResponse.json({ success: true, target: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error posting comment on target";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
