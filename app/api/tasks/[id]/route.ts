import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TaskService from "@/services/taskService";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await requireAuth();
    const task = await TaskService.getTaskById(params.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth(["admin", "manager"]);
    const deleted = await TaskService.deleteTask(actor, params.id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
