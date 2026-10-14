import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import QueryService from "@/services/queryService";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const { reason } = await req.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Reopen explanation is required" }, { status: 400 });
    }

    const updated = await QueryService.reopenQuery(actor, params.id, reason);
    return NextResponse.json({ success: true, query: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reopening query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
