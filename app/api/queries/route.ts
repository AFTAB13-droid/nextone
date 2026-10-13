import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import QueryService from "@/services/queryService";

export async function GET(req: Request) {
  try {
    const actor = await requireAuth();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;

    const queries = await QueryService.getQueries(actor, {
      status,
      category,
      priority,
    });

    return NextResponse.json({ queries });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch queries";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();
    const body = await req.json();

    const query = await QueryService.createQuery(actor, body);
    return NextResponse.json({ success: true, query }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create query";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
