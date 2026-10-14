import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TodoService from "@/services/todoService";

export async function GET() {
  try {
    const actor = await requireAuth();
    const todos = await TodoService.getUserTodos(actor.userId);
    return NextResponse.json({ todos });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching todos";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "To-do text is required" }, { status: 400 });
    }

    const todo = await TodoService.createTodo(actor.userId, text);
    return NextResponse.json({ success: true, todo }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating to-do";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
