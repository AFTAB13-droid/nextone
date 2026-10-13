import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TaskService from "@/services/taskService";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const { status, note, progressPercentage } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "New status is required" }, { status: 400 });
    }

    const updatedTask = await TaskService.updateTaskLifecycle(
      actor,
      params.id,
      status,
      note,
      progressPercentage
    );

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating task status";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
