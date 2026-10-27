"use client";

import React, { useState, useEffect } from "react";
import {
  Target as TargetIcon,
  Save,
  Sparkles,
  CheckCircle2,
  Clock,
  Pencil,
  X,
  Send,
  MessageSquare,
  Check,
  Plus,
  AlertCircle,
} from "lucide-react";
import { ITarget, UserRole } from "@/lib/types";

interface TodayTargetEditorProps {
  todayTarget: ITarget | null;
  onTargetSaved?: (target: ITarget) => void;
  onCommentAdded?: (updated: ITarget) => void;
  currentUserRole?: UserRole;
  currentUserId?: string;
}

const QUICK_SUGGESTIONS = [
  "Prepare Corporate Presentation & Client Onboarding Kit",
  "Reconcile Q3 Vendor Invoices & Dispatch Payment Vouchers",
  "Follow up with Corporate Accounts for Contract Renewals",
  "Conduct Client Walkthrough & Training Session",
  "Draft Internal Standard Operating Procedures (SOP)",
];

export function TodayTargetEditor({
  todayTarget,
  onTargetSaved,
  onCommentAdded,
  currentUserRole = "employee",
  currentUserId,
}: TodayTargetEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [targetText, setTargetText] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "in_progress" | "achieved" | "partially_achieved">("in_progress");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick note logger state
  const [quickNote, setQuickNote] = useState("");
  const [loggingNote, setLoggingNote] = useState(false);

  // Comment thread state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (todayTarget) {
      setTargetText(todayTarget.targetText || "");
      setProgressNotes(todayTarget.progressNotes || "");
      setStatus(todayTarget.status || "in_progress");
      setIsEditing(false);
    } else {
      setTargetText("");
      setProgressNotes("");
      setStatus("in_progress");
      setIsEditing(true); // Open creation form if no target set
    }
  }, [todayTarget]);

  // Handle Full Form Submit (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetText.trim()) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetText, progressNotes, status }),
      });
      const data = await res.json();
      if (res.ok && data.target) {
        setMessage("Today's commitment saved successfully!");
        setIsEditing(false);
        if (onTargetSaved) onTargetSaved(data.target);
        setTimeout(() => setMessage(null), 4000);
      } else {
        setError(data.error || "Failed to save commitment");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error saving target";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Quick Status Toggle (e.g. Mark as Achieved)
  const handleQuickStatus = async (newStatus: "achieved" | "in_progress" | "partially_achieved") => {
    if (!todayTarget) return;
    setSaving(true);
    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetText: todayTarget.targetText,
          progressNotes: todayTarget.progressNotes,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.target) {
        setStatus(newStatus);
        setMessage(newStatus === "achieved" ? "Target marked as Achieved! Great job!" : "Status updated.");
        if (onTargetSaved) onTargetSaved(data.target);
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Append a timestamped quick progress update
  const handleAddQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim() || !todayTarget) return;

    setLoggingNote(true);
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedNote = `[${nowTime}] ${quickNote.trim()}`;
    const updatedNotes = todayTarget.progressNotes
      ? `${todayTarget.progressNotes}\n${formattedNote}`
      : formattedNote;

    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetText: todayTarget.targetText,
          progressNotes: updatedNotes,
          status: todayTarget.status,
        }),
      });
      const data = await res.json();
      if (res.ok && data.target) {
        setProgressNotes(updatedNotes);
        setQuickNote("");
        setMessage("Progress update logged!");
        if (onTargetSaved) onTargetSaved(data.target);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingNote(false);
    }
  };

  // Add Comment/Reply to manager
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !todayTarget) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/targets/${todayTarget._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commentText }),
      });
      const data = await res.json();
      if (res.ok && data.target) {
        setCommentText("");
        if (onCommentAdded) onCommentAdded(data.target);
        if (onTargetSaved) onTargetSaved(data.target);
      } else {
        alert(data.error || "Failed to post comment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // ================= VIEW MODE: ACTIVE TODAY'S TARGET CARD =================
  if (todayTarget && !isEditing) {
    const isAchieved = todayTarget.status === "achieved";
    const comments = todayTarget.comments || [];

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden space-y-6">
        {/* Top Accent Bar */}
        <div
          className={`absolute top-0 inset-x-0 h-1.5 ${
            isAchieved
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
              : "bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600"
          }`}
        />

        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
                isAchieved
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-indigo-50 text-indigo-600 border border-indigo-200"
              }`}
            >
              <TargetIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Today&apos;s Target</h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isAchieved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : todayTarget.status === "in_progress"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
                >
                  {isAchieved
                    ? "Achieved"
                    : todayTarget.status === "in_progress"
                    ? "In Progress"
                    : "Committed"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{todayFormatted}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {!isAchieved && (
              <button
                type="button"
                onClick={() => handleQuickStatus("achieved")}
                disabled={saving}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                title="Mark this target as successfully achieved"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Mark Achieved</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Goal</span>
            </button>
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 2-Column Responsive Cockpit on Wide Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Commitment & Progress Updates */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5">
            {/* Commitment Statement */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Committed Deliverable / Milestone
              </label>
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 text-sm font-semibold text-slate-900 leading-relaxed shadow-2xs">
                {todayTarget.targetText}
              </div>
            </div>

            {/* Ongoing Progress Notes & Quick Update */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Ongoing Progress Updates
                </span>
                {todayTarget.lastUpdatedTime && (
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    Last updated: {new Date(todayTarget.lastUpdatedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </label>

              {todayTarget.progressNotes ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/70 text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {todayTarget.progressNotes}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No progress notes logged yet today.</p>
              )}

              {/* Quick inline note adder */}
              <form onSubmit={handleAddQuickNote} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Log a quick progress update (e.g. Completed initial draft)..."
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={loggingNote || !quickNote.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{loggingNote ? "Logging..." : "Log Update"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Manager Feedback & Discussion Thread */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Manager Feedback & Coaching
                </label>
                <span className="text-xs font-semibold text-slate-400">
                  {comments.length} {comments.length === 1 ? "note" : "notes"}
                </span>
              </div>

              {comments.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {comments.map((c, idx) => (
                    <div
                      key={c._id || idx}
                      className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{c.author.name}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {c.author.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{c.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 bg-slate-50 rounded-2xl px-3 border border-dashed border-slate-200 text-center">
                  No feedback notes from manager yet today.
                </p>
              )}
            </div>

            {/* Reply input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Reply to manager or leave note..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ================= EDIT / CREATE MODE =================
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden space-y-5">
      {/* Top Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {todayTarget ? "Edit Today's Commitment" : "Set Today's Target"}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{todayFormatted}</p>
          </div>
        </div>

        {todayTarget && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Suggestion Chips (when empty) */}
      {!todayTarget && (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick Suggestions (Click to autofill)
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTargetText(sug)}
                className="text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition-colors text-left"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Daily Commitment / Goal <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="What key outcomes, milestones, or deliverables are you committed to delivering today?"
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Initial Progress Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. 10:30 AM: Reviewed slide deck outline with design team..."
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="in_progress">In Progress</option>
              <option value="achieved">Achieved</option>
              <option value="partially_achieved">Partially Achieved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {todayTarget && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving || !targetText.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : todayTarget ? "Update Commitment" : "Save Today's Commitment"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TodayTargetEditor;
