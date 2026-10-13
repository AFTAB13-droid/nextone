import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TaskService from "@/services/taskService";

export async function GET() {
  try {
    const actor = await requireAuth();
    const metrics = await TaskService.getTaskMetrics(actor);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching task metrics";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
