import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TaskService from "@/services/taskService";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth(["manager", "admin"]);
    const body = await req.json();

    const subtask = await TaskService.splitTask(actor, params.id, body);
    return NextResponse.json({ success: true, task: subtask }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error splitting task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
