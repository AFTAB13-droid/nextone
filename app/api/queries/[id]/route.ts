import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import QueryService from "@/services/queryService";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await requireAuth();
    const query = await QueryService.getQueryById(params.id);
    if (!query) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 });
    }
    return NextResponse.json({ query });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updated = await QueryService.updateStatus(actor, params.id, status);
    return NextResponse.json({ success: true, query: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating query status";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
