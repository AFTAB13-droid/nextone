import connectDB from "@/lib/mongodb";
import Note from "@/models/Note";
import { INote } from "@/lib/types";

export class NoteService {
  static async getUserNotes(userId: string): Promise<INote[]> {
    await connectDB();
    const notes = await Note.find({ user: userId })
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return notes as unknown as INote[];
  }

  static async createNote(
    userId: string,
    title: string,
    content: string = "",
    tag: string = "General",
    color: string = "#6366f1",
    attachments: string[] = []
  ): Promise<INote> {
    await connectDB();

    const note = await Note.create({
      user: userId,
      title: title.trim(),
      content: content.trim(),
      tag: tag.trim(),
      color,
      isPinned: false,
      attachments,
    });

    return note.toObject() as unknown as INote;
  }

  static async updateNote(
    userId: string,
    noteId: string,
    updates: Partial<INote>
  ): Promise<INote | null> {
    await connectDB();

    const updated = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      { $set: updates },
      { new: true }
    ).lean();

    return updated as unknown as INote;
  }

  static async deleteNote(userId: string, noteId: string): Promise<boolean> {
    await connectDB();
    const res = await Note.deleteOne({ _id: noteId, user: userId });
    return res.deletedCount > 0;
  }
}

export default NoteService;
