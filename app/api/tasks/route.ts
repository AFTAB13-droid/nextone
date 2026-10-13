import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TaskService from "@/services/taskService";

export async function GET(req: Request) {
  try {
    const actor = await requireAuth();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assignedTo = searchParams.get("assignedTo") || undefined;
    const assignedBy = searchParams.get("assignedBy") || undefined;
    const search = searchParams.get("search") || undefined;

    const tasks = await TaskService.getTasks(actor, {
      status,
      priority,
      assignedTo,
      assignedBy,
      search,
    });

    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch tasks";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAuth(["admin", "manager"]);
    const body = await req.json();

    const task = await TaskService.createTask(actor, body);
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
