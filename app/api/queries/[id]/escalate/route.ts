import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import QueryService from "@/services/queryService";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth(["manager"]);
    const { note } = await req.json();

    const updated = await QueryService.escalateQuery(actor, params.id, note);
    return NextResponse.json({ success: true, query: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error escalating query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
