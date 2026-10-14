import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import NoteService from "@/services/noteService";

export async function GET() {
  try {
    const actor = await requireAuth();
    const notes = await NoteService.getUserNotes(actor.userId);
    return NextResponse.json({ notes });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching notes";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();
    const { title, content, tag, color } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Note title is required" }, { status: 400 });
    }

    const note = await NoteService.createNote(actor.userId, title, content, tag, color);
    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
