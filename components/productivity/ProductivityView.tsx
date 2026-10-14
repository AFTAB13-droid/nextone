"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { INote, ITodo, AuthSession } from "@/lib/types";

interface ProductivityViewProps {
  currentUser: AuthSession;
}

export function ProductivityView({ currentUser }: ProductivityViewProps) {
  // Tabs: all, notes, todos
  const [activeTab, setActiveTab] = useState<"both" | "notes" | "todos">("both");

  // Notes state
  const [notes, setNotes] = useState<INote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteSearch, setNoteSearch] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTag, setNoteTag] = useState("Work");
  const [noteColor, setNoteColor] = useState("indigo");
  const [noteSaving, setNoteSaving] = useState(false);

  // To-dos state
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [newTodoText, setNewTodoText] = useState("");
  const [todoSubmitting, setTodoSubmitting] = useState(false);
  const [todoTab, setTodoTab] = useState<"pending" | "completed">("pending");

  // Load Notes
  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      const res = await fetch("/api/notes");
      if (res.ok) {
        const d = await res.json();
        setNotes(d.notes || []);
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

  // Save or Update Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    setNoteSaving(true);
    try {
      if (editingNote) {
        const res = await fetch(`/api/notes/${editingNote._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            tag: noteTag,
            color: noteColor,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setNotes((prev) => prev.map((n) => (n._id === d.note._id ? d.note : n)));
          closeNoteModal();
        }
      } else {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            tag: noteTag,
            color: noteColor,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setNotes((prev) => [d.note, ...prev]);
          closeNoteModal();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this private note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateNote = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteTag("Work");
    setNoteColor("indigo");
    setIsNoteModalOpen(true);
  };

  const openEditNote = (note: INote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTag(note.tag || "Work");
    setNoteColor(note.color || "indigo");
    setIsNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setEditingNote(null);
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
        body: JSON.stringify({ text: newTodoText }),
      });
      if (res.ok) {
        const d = await res.json();
        setTodos((prev) => [d.todo, ...prev]);
        setNewTodoText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTodoSubmitting(false);
    }
  };

  // Toggle Todo
  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    try {
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t._id === id
            ? { ...t, completed: !currentCompleted, completedAt: !currentCompleted ? new Date() : undefined }
            : t
        )
      );

      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (res.ok) {
        const d = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === d.todo._id ? d.todo : t)));
      }
    } catch (err) {
      console.error(err);
      fetchTodos();
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (id: string) => {
    try {
      setTodos((prev) => prev.filter((t) => t._id !== id));
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
      fetchTodos();
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content?.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.tag?.toLowerCase().includes(noteSearch.toLowerCase())
  );

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const colorVariants: Record<string, { bg: string; border: string; tagBg: string }> = {
    indigo: { bg: "bg-indigo-50/40", border: "border-indigo-200/80", tagBg: "bg-indigo-100 text-indigo-700" },
    emerald: { bg: "bg-emerald-50/40", border: "border-emerald-200/80", tagBg: "bg-emerald-100 text-emerald-700" },
    amber: { bg: "bg-amber-50/40", border: "border-amber-200/80", tagBg: "bg-amber-100 text-amber-700" },
    rose: { bg: "bg-rose-50/40", border: "border-rose-200/80", tagBg: "bg-rose-100 text-rose-700" },
    violet: { bg: "bg-violet-50/40", border: "border-violet-200/80", tagBg: "bg-violet-100 text-violet-700" },
    slate: { bg: "bg-slate-50", border: "border-slate-200", tagBg: "bg-slate-200 text-slate-700" },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide uppercase text-slate-200 flex items-center gap-1.5">
              <span>Strict Private Sanctuary</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                End-to-End User Isolation
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Per Section 7 & 8: Notes and to-dos are strictly private to you ({currentUser.name}). No managers, subordinates, or admins can view this content.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab("both")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "both" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "notes" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab("todos")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "todos" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            To-dos ({pendingTodos.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid gap-6 ${activeTab === "both" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
        {/* ================= NOTES COLUMN ================= */}
        {(activeTab === "both" || activeTab === "notes") && (
          <div className={activeTab === "both" ? "lg:col-span-7 space-y-4" : "space-y-4"}>
            {/* Header & Controls */}
            <div className="glass-card p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Personal Notes</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Quick thoughts, scratchpads, & snippets</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                    className="w-40 sm:w-48 text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={openCreateNote}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Note</span>
                </button>
              </div>
            </div>

            {/* Notes Grid */}
            {notesLoading ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading notes...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                <h5 className="text-xs font-bold text-slate-700">No personal notes found</h5>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click &quot;New Note&quot; to jot down personal reminders or ideas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredNotes.map((note) => {
                  const style = colorVariants[note.color || "indigo"] || colorVariants.indigo;
                  return (
                    <div
                      key={note._id}
                      className={`p-4 rounded-2xl border ${style.border} ${style.bg} transition-all hover:shadow-md flex flex-col justify-between group relative`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                            {note.title}
                          </h4>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditNote(note)}
                              className="p-1 hover:bg-white/80 rounded-lg text-slate-500 hover:text-slate-800"
                              title="Edit Note"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="p-1 hover:bg-white/80 rounded-lg text-slate-400 hover:text-rose-600"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-5 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                        {note.tag && (
                          <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${style.tagBg}`}>
                            {note.tag}
                          </span>
                        )}
                        <span className="text-slate-400 font-mono ml-auto">
                          {new Date(note.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TO-DO COLUMN ================= */}
        {(activeTab === "both" || activeTab === "todos") && (
          <div className={activeTab === "both" ? "lg:col-span-5 space-y-4" : "space-y-4"}>
            {/* To-Do Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Personal To-do List</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Daily checklists & personal items</p>
                  </div>
                </div>

                {/* Sub-tabs: Pending vs Completed */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setTodoTab("pending")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      todoTab === "pending"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Pending ({pendingTodos.length})
                  </button>
                  <button
                    onClick={() => setTodoTab("completed")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      todoTab === "completed"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Done ({completedTodos.length})
                  </button>
                </div>
              </div>

              {/* Add Todo Form */}
              <form onSubmit={handleAddTodo} className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="What do you need to do? Press Enter..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={todoSubmitting || !newTodoText.trim()}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shadow-sm shadow-emerald-600/20 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* To-Do Items List */}
              {todosLoading ? (
                <div className="text-center py-6 text-slate-400 text-xs">Loading items...</div>
              ) : todoTab === "pending" ? (
                pendingTodos.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-70" />
                    <p className="text-xs font-bold text-slate-700">All caught up!</p>
                    <p className="text-[11px] text-slate-400">You have no pending items on your checklist.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {pendingTodos.map((todo) => (
                      <div
                        key={todo._id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-colors group"
                      >
                        <button
                          onClick={() => handleToggleTodo(todo._id, todo.completed)}
                          className="flex items-center gap-2.5 text-left flex-1"
                        >
                          <Circle className="w-4 h-4 text-slate-400 hover:text-emerald-500 shrink-0 transition-colors" />
                          <span className="text-xs font-semibold text-slate-800 leading-snug">
                            {todo.text}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : completedTodos.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs font-semibold">No completed items yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {completedTodos.map((todo) => (
                    <div
                      key={todo._id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-200/50 group"
                    >
                      <button
                        onClick={() => handleToggleTodo(todo._id, todo.completed)}
                        className="flex items-center gap-2.5 text-left flex-1"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-medium text-slate-400 line-through leading-snug">
                          {todo.text}
                        </span>
                      </button>
                      {todo.completedAt && (
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(todo.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteTodo(todo._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Note Creation / Edit Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <button
              onClick={closeNoteModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              {editingNote ? "Edit Private Note" : "Create New Private Note"}
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint priorities, API credentials, Ideas..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your private note details here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tag / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Work, Ideas, Bug"
                    value={noteTag}
                    onChange={(e) => setNoteTag(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Card Accent Color
                  </label>
                  <select
                    value={noteColor}
                    onChange={(e) => setNoteColor(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="indigo">Indigo Accent</option>
                    <option value="emerald">Emerald Accent</option>
                    <option value="amber">Amber Accent</option>
                    <option value="rose">Rose Accent</option>
                    <option value="violet">Violet Accent</option>
                    <option value="slate">Neutral Slate</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeNoteModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteSaving || !noteTitle.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {noteSaving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductivityView;
