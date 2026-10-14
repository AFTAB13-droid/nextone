import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import NoteService from "@/services/noteService";

interface RouteParams {
  params: { id: string };
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const body = await req.json();

    const updated = await NoteService.updateNote(actor.userId, params.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, note: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    const deleted = await NoteService.deleteNote(actor.userId, params.id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
