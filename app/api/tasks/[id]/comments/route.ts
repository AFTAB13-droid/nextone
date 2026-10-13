import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TaskService from "@/services/taskService";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const { message, attachments } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Comment message cannot be empty" }, { status: 400 });
    }

    const updatedTask = await TaskService.addTaskComment(
      actor,
      params.id,
      message,
      attachments || []
    );

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error posting comment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
