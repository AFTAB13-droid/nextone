"use client";

import React, { useState } from "react";
import {
  Target as TargetIcon,
  MessageSquare,
  Send,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
import { ITarget, UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface TargetCardProps {
  target: ITarget;
  currentUserRole?: UserRole;
  currentUserId?: string;
  onCommentAdded?: (updated: ITarget) => void;
  showEmployeeHeader?: boolean;
}

export function TargetCard({
  target,
  currentUserRole,
  currentUserId,
  onCommentAdded,
  showEmployeeHeader = false,
}: TargetCardProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(target.comments || []);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/targets/${target._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commentText }),
      });
      const data = await res.json();
      if (res.ok && data.target) {
        setComments(data.target.comments || []);
        setCommentText("");
        if (onCommentAdded) {
          onCommentAdded(data.target);
        }
      } else {
        alert(data.error || "Failed to post comment");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusVariant = (status?: string) => {
    switch (status) {
      case "achieved":
        return "success";
      case "in_progress":
        return "primary";
      case "partially_achieved":
        return "warning";
      case "pending":
      default:
        return "neutral";
    }
  };

  const statusLabel = (status?: string) => {
    switch (status) {
      case "achieved":
        return "Achieved";
      case "in_progress":
        return "In Progress";
      case "partially_achieved":
        return "Partially Achieved";
      case "pending":
      default:
        return "Pending";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {showEmployeeHeader && target.employee && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-inner uppercase">
                {target.employee.avatar ? (
                  <img
                    src={target.employee.avatar}
                    alt={target.employee.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  target.employee.name?.charAt(0) || "U"
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {target.employee.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {target.employee.designation || target.employee.department || target.employee.role}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {target.date}
            </span>
            <Badge variant={statusVariant(target.status)} size="sm">
              {statusLabel(target.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Body: Target Text & Progress Notes */}
      <div className="p-5 space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <TargetIcon className="w-3.5 h-3.5 text-indigo-500" />
            Daily Commitment / Target
          </label>
          <p className="text-sm font-semibold text-slate-800 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
            {target.targetText}
          </p>
        </div>

        {target.progressNotes && (
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Progress Notes
            </label>
            <p className="text-xs font-medium text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100/70 leading-relaxed whitespace-pre-wrap">
              {target.progressNotes}
            </p>
          </div>
        )}

        {target.lastUpdatedTime && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
            <span>
              Updated: {new Date(target.lastUpdatedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-slate-400 font-sans flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              {comments.length} feedback {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>
        )}
      </div>

      {/* Comments / Feedback Section */}
      <div className="border-t border-slate-100 bg-slate-50/40 p-4">
        {comments.length > 0 && (
          <div className="space-y-2.5 mb-3 max-h-48 overflow-y-auto pr-1">
            {comments.map((c, idx) => (
              <div
                key={c._id || idx}
                className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{c.author.name}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
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
        )}

        {/* Add Comment Input */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              currentUserRole === "admin" || currentUserRole === "manager"
                ? "Add feedback or guidance comment..."
                : "Reply to manager/admin feedback..."
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0 shadow-sm shadow-indigo-600/20"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default TargetCard;
