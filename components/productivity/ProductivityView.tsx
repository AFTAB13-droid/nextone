"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Pin,
  Tag,
  Search,
  Sparkles,
  Lock,
  Clock,
  X,
  Palette,
  Image as ImageIcon,
  Paperclip,
  Maximize2,
  Calendar,
  Layers,
  ArrowRight,
  Upload,
} from "lucide-react";
import { INote, ITodo, AuthSession } from "@/lib/types";
import Image from "next/image";

interface ProductivityViewProps {
  currentUser: AuthSession;
}

export function ProductivityView({ currentUser }: ProductivityViewProps) {
  // Tabs: notes, todos, both
  const [activeTab, setActiveTab] = useState<"notes" | "todos">("notes");

  // Notes state
  const [notes, setNotes] = useState<INote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteSearch, setNoteSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Note editor form
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorTag, setEditorTag] = useState("Work");
  const [editorColor, setEditorColor] = useState("#f59e0b");
  const [editorAttachments, setEditorAttachments] = useState<string[]>([]);
  const [isEditorPinned, setIsEditorPinned] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Lightbox / Image preview modal
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // To-dos state
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [newTodoText, setNewTodoText] = useState("");
  const [todoAttachments, setTodoAttachments] = useState<string[]>([]);
  const [todoSubmitting, setTodoSubmitting] = useState(false);
  const [todoTab, setTodoTab] = useState<"pending" | "completed">("pending");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const todoFileInputRef = useRef<HTMLInputElement>(null);

  // Load Notes
  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      const res = await fetch("/api/notes");
      if (res.ok) {
        const d = await res.json();
        const loadedNotes: INote[] = d.notes || [];
        setNotes(loadedNotes);
        if (loadedNotes.length > 0 && !selectedNoteId && !isCreatingNew) {
          selectNote(loadedNotes[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNotesLoading(false);
    }
  };

  // Load Todos
  const fetchTodos = async () => {
    try {
      setTodosLoading(true);
      const res = await fetch("/api/todos");
      if (res.ok) {
        const d = await res.json();
        setTodos(d.todos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTodosLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchTodos();
  }, []);

  const selectNote = (note: INote) => {
    setSelectedNoteId(note._id);
    setIsCreatingNew(false);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorTag(note.tag || "Work");
    setEditorColor(note.color || "#f59e0b");
    setEditorAttachments(note.attachments || []);
    setIsEditorPinned(Boolean(note.isPinned));
  };

  const handleStartNewNote = () => {
    setSelectedNoteId(null);
    setIsCreatingNew(true);
    setEditorTitle("");
    setEditorContent("");
    setEditorTag("Work");
    setEditorColor("#f59e0b");
    setEditorAttachments([]);
    setIsEditorPinned(false);
  };

  // Upload Media from device
  const handleMediaUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "note" | "todo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder: "notes_media" }),
        });
        const d = await res.json();
        const uploadedUrl = d.url || base64;
        if (target === "note") {
          setEditorAttachments((prev) => [...prev, uploadedUrl]);
        } else {
          setTodoAttachments((prev) => [...prev, uploadedUrl]);
        }
      } catch {
        if (target === "note") {
          setEditorAttachments((prev) => [...prev, base64]);
        } else {
          setTodoAttachments((prev) => [...prev, base64]);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Save current note
  const handleSaveCurrentNote = async () => {
    if (!editorTitle.trim()) return;
    setIsSavingNote(true);

    try {
      if (selectedNoteId) {
        const res = await fetch(`/api/notes/${selectedNoteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editorTitle.trim(),
            content: editorContent.trim(),
            tag: editorTag,
            color: editorColor,
            isPinned: isEditorPinned,
            attachments: editorAttachments,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setNotes((prev) => prev.map((n) => (n._id === d.note._id ? d.note : n)));
        }
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editorTitle.trim(),
            content: editorContent.trim(),
            tag: editorTag,
            color: editorColor,
            attachments: editorAttachments,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setNotes((prev) => [d.note, ...prev]);
          setSelectedNoteId(d.note._id);
          setIsCreatingNew(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this private note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        const remaining = notes.filter((n) => n._id !== id);
        setNotes(remaining);
        if (remaining.length > 0) {
          selectNote(remaining[0]);
        } else {
          handleStartNewNote();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async () => {
    const nextPinned = !isEditorPinned;
    setIsEditorPinned(nextPinned);
    if (selectedNoteId) {
      await fetch(`/api/notes/${selectedNoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: nextPinned }),
      });
      setNotes((prev) =>
        prev.map((n) => (n._id === selectedNoteId ? { ...n, isPinned: nextPinned } : n))
      );
    }
  };

  // Add Todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setTodoSubmitting(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTodoText.trim(), attachments: todoAttachments }),
      });
      if (res.ok) {
        const d = await res.json();
        setTodos((prev) => [d.todo, ...prev]);
        setNewTodoText("");
        setTodoAttachments([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTodoSubmitting(false);
    }
  };

  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    try {
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, completed: !currentCompleted } : t))
      );
      await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
    } catch (e) {
      console.error(e);
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setTodos((prev) => prev.filter((t) => t._id !== id));
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
      fetchTodos();
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content?.toLowerCase().includes(noteSearch.toLowerCase());
    const matchesTag = selectedTag === "All" || n.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const availableTags = ["All", "Work", "Productivity", "Architecture", "Personal", "Ideas"];

  return (
    <div className="space-y-6">
      {/* Lightbox Modal */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={previewMediaUrl}
              alt="Media Preview"
              width={1000}
              height={800}
              className="object-contain max-h-[85vh] w-auto h-auto rounded-2xl"
              unoptimized
            />
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Top MacBook Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* macOS window traffic lights */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200/80 border border-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>MacBook Notes & Workspace</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Encrypted & Private
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Apple macOS inspired note-taking canvas with media uploads and isolated to-do list
            </p>
          </div>
        </div>

        {/* View Switcher: Notes vs Reminders */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "notes"
                ? "bg-amber-400 text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>MacBook Notes ({notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("todos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "todos"
                ? "bg-amber-400 text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Reminders & To-Dos ({todos.filter((t) => !t.completed).length})</span>
          </button>
        </div>
      </div>

      {/* ================= MACBOOK NOTES VIEW ================= */}
      {activeTab === "notes" && (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
          {/* ================= LEFT COLUMN: NOTES LIST ================= */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Search & New Note Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={handleStartNewNote}
                  className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl font-bold shadow-sm transition-all btn-action shrink-0"
                  title="New Note"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Tag Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-[11px] font-bold">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                      selectedTag === tag
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {notesLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading notes...</div>
                ) : filteredNotes.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No notes found. Click &apos;+&apos; to create your first note.
                  </div>
                ) : (
                  <>
                    {/* Pinned Section */}
                    {pinnedNotes.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 px-1">
                          <Pin className="w-3 h-3 text-amber-500" />
                          <span>Pinned</span>
                        </span>
                        {pinnedNotes.map((note) => {
                          const isSelected = selectedNoteId === note._id;
                          return (
                            <div
                              key={note._id}
                              onClick={() => selectNote(note)}
                              className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                                isSelected
                                  ? "bg-amber-100/90 border-amber-300 shadow-sm"
                                  : "bg-white hover:bg-white/80 border-slate-200/80 shadow-2xs"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-black text-slate-900 truncate">
                                  {note.title || "Untitled Note"}
                                </h4>
                                <Pin className="w-3 h-3 text-amber-600 shrink-0 fill-amber-500" />
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {note.content || "No additional text"}
                              </p>
                              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                                <span>{new Date(note.updatedAt).toLocaleDateString("en-IN")}</span>
                                {note.attachments && note.attachments.length > 0 && (
                                  <span className="flex items-center gap-1 text-indigo-600 font-bold">
                                    <ImageIcon className="w-3 h-3" />
                                    {note.attachments.length} media
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Other Notes */}
                    <div className="space-y-1.5">
                      {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                          Notes
                        </span>
                      )}
                      {otherNotes.map((note) => {
                        const isSelected = selectedNoteId === note._id;
                        return (
                          <div
                            key={note._id}
                            onClick={() => selectNote(note)}
                            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-amber-100/90 border-amber-300 shadow-sm"
                                : "bg-white hover:bg-white/80 border-slate-200/80 shadow-2xs"
                            }`}
                          >
                            <h4 className="text-xs font-black text-slate-900 truncate">
                              {note.title || "Untitled Note"}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {note.content || "No additional text"}
                            </p>
                            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                              <span>{new Date(note.updatedAt).toLocaleDateString("en-IN")}</span>
                              {note.attachments && note.attachments.length > 0 && (
                                <span className="flex items-center gap-1 text-indigo-600 font-bold">
                                  <ImageIcon className="w-3 h-3" />
                                  {note.attachments.length} media
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-400 text-center font-medium">
              Strict Privacy: Only accessible to your user session
            </div>
          </div>

          {/* ================= RIGHT COLUMN: MACBOOK NOTE CANVAS ================= */}
          <div className="md:col-span-7 lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between bg-amber-50/20">
            <div>
              {/* Note Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <select
                    value={editorTag}
                    onChange={(e) => setEditorTag(e.target.value)}
                    className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Work">Category: Work</option>
                    <option value="Productivity">Category: Productivity</option>
                    <option value="Architecture">Category: Architecture</option>
                    <option value="Personal">Category: Personal</option>
                    <option value="Ideas">Category: Ideas</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleTogglePin}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      isEditorPinned
                        ? "bg-amber-400 text-slate-900 border-amber-500 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${isEditorPinned ? "fill-slate-900" : ""}`} />
                    <span>{isEditorPinned ? "Pinned" : "Pin Note"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Upload Image from Device Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e, "note")}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                    title="Upload Media from device"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add Media</span>
                  </button>

                  {/* Delete button (if existing note) */}
                  {selectedNoteId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(selectedNoteId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Save Note Button */}
                  <button
                    type="button"
                    onClick={handleSaveCurrentNote}
                    disabled={isSavingNote || !editorTitle.trim()}
                    className="px-4 py-1.5 rounded-xl text-xs font-black text-slate-900 bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 btn-action"
                  >
                    {isSavingNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>

              {/* Note Content Canvas */}
              <div className="space-y-4">
                {/* Note Title */}
                <input
                  type="text"
                  placeholder="Note Title (e.g. Q4 Sprint Architecture & UPI Integration)..."
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black text-slate-900 bg-transparent placeholder:text-slate-300 focus:outline-none border-b border-transparent focus:border-amber-300 pb-1"
                />

                {/* Date Display */}
                <p className="text-[11px] text-slate-400 font-mono">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {/* Note Body Textarea */}
                <textarea
                  rows={10}
                  placeholder="Start typing your private notes, technical specifications, or meeting minutes..."
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full text-sm sm:text-base bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-sans"
                />

                {/* Media Attachments Gallery */}
                {editorAttachments.length > 0 && (
                  <div className="pt-4 border-t border-amber-100">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Media Attachments ({editorAttachments.length})</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {editorAttachments.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-video shadow-xs cursor-pointer"
                        >
                          <Image
                            src={url}
                            alt={`Attachment ${idx + 1}`}
                            width={240}
                            height={160}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onClick={() => setPreviewMediaUrl(url)}
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditorAttachments((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-amber-100/60 flex items-center justify-between text-xs text-slate-400">
              <span>{editorContent.length} characters</span>
              <span className="text-[11px] font-mono text-amber-700">Auto-synced with MongoDB Atlas</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TO-DO & REMINDERS VIEW ================= */}
      {activeTab === "todos" && (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Personal Task Checklist & Media Reminders
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Maintain confidential to-do items and attach screenshots or reference specs
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTodoTab("pending")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  todoTab === "pending"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({todos.filter((t) => !t.completed).length})
              </button>
              <button
                onClick={() => setTodoTab("completed")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  todoTab === "completed"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Completed ({todos.filter((t) => t.completed).length})
              </button>
            </div>
          </div>

          {/* New Todo Form with Media Attachment */}
          <form onSubmit={handleAddTodo} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="What needs to be done? (e.g. Verify Razorpay webhook logs for Bangalore merchants)..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 font-medium transition-all"
              />

              <input
                type="file"
                ref={todoFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleMediaUpload(e, "todo")}
              />
              <button
                type="button"
                onClick={() => todoFileInputRef.current?.click()}
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Attach image to to-do"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                type="submit"
                disabled={todoSubmitting || !newTodoText.trim()}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 btn-action"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Todo attachment preview */}
            {todoAttachments.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                {todoAttachments.map((url, i) => (
                  <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300">
                    <Image
                      src={url}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => setTodoAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Todo List */}
          <div className="space-y-2.5">
            {todosLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading checklist...</div>
            ) : todos.filter((t) => (todoTab === "completed" ? t.completed : !t.completed)).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                {todoTab === "pending"
                  ? "All caught up! No pending to-do items."
                  : "No completed items yet."}
              </div>
            ) : (
              todos
                .filter((t) => (todoTab === "completed" ? t.completed : !t.completed))
                .map((todo) => (
                  <div
                    key={todo._id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300 flex items-start justify-between gap-3 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTodo(todo._id, todo.completed)}
                        className="mt-0.5 text-slate-400 hover:text-amber-500 transition-colors shrink-0"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-amber-500" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-medium ${
                            todo.completed ? "line-through text-slate-400" : "text-slate-800"
                          }`}
                        >
                          {todo.text}
                        </p>

                        {/* Attachments if any */}
                        {todo.attachments && todo.attachments.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            {todo.attachments.map((url, i) => (
                              <div
                                key={i}
                                onClick={() => setPreviewMediaUrl(url)}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                <Image
                                  src={url}
                                  alt="Attachment"
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          {new Date(todo.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTodo(todo._id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductivityView;
