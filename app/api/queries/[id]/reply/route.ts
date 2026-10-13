import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import QueryService from "@/services/queryService";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const { message, attachments } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const updated = await QueryService.addResponse(actor, params.id, message, attachments);
    return NextResponse.json({ success: true, query: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error replying to query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
