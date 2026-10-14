import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TodoService from "@/services/todoService";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    let completed: boolean | undefined = undefined;

    try {
      const body = await req.json();
      if (typeof body.completed === "boolean") {
        completed = body.completed;
      }
    } catch {
      // toggle default
    }

    const updated = await TodoService.toggleTodo(actor.userId, params.id, completed);
    if (!updated) {
      return NextResponse.json({ error: "To-do not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, todo: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating to-do";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const deleted = await TodoService.deleteTodo(actor.userId, params.id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting to-do";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
