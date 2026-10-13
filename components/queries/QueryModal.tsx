"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, PriorityBadge, RoleBadge } from "@/components/ui/Badge";
import {
  Send,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { IQuery, QueryStatus, AuthSession } from "@/lib/types";
import Image from "next/image";

interface QueryModalProps {
  query: IQuery | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthSession;
  onQueryUpdated: (updated: IQuery) => void;
}

export function QueryModal({
  query,
  isOpen,
  onClose,
  currentUser,
  onQueryUpdated,
}: QueryModalProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalationNote, setEscalationNote] = useState("");
  const [showEscalateBox, setShowEscalateBox] = useState(false);

  if (!query) return null;

  const isEscalated = Boolean(query.escalatedTo);
  const canEscalate =
    currentUser.role === "manager" && !isEscalated && query.status !== "resolved";

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/queries/${query._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      if (res.ok) {
        const data = await res.json();
        onQueryUpdated(data.query);
        setReplyMessage("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      const res = await fetch(`/api/queries/${query._id}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: escalationNote }),
      });
      if (res.ok) {
        const data = await res.json();
        onQueryUpdated(data.query);
        setShowEscalateBox(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEscalating(false);
    }
  };

  const handleStatusChange = async (newStatus: QueryStatus) => {
    try {
      const res = await fetch(`/api/queries/${query._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        onQueryUpdated(data.query);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={query.title}
      description={`Raised by ${query.raisedBy?.name} • Category: ${query.category.toUpperCase()}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-2">
            <StatusBadge status={query.status} />
            <PriorityBadge priority={query.priority} />
            {isEscalated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Escalated to Executive Admin
              </span>
            )}
          </div>

          {/* Quick status actions for Admin & Manager */}
          {(currentUser.role === "admin" || currentUser.role === "manager") && (
            <div className="flex items-center gap-2">
              {query.status !== "resolved" && (
                <button
                  onClick={() => handleStatusChange("resolved")}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Resolved
                </button>
              )}
              {canEscalate && !showEscalateBox && (
                <button
                  onClick={() => setShowEscalateBox(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Escalate to Admin
                </button>
              )}
            </div>
          )}
        </div>

        {/* Escalation Box */}
        {showEscalateBox && (
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-3">
            <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
              Escalate this inquiry to Executive Admin
            </h4>
            <p className="text-xs text-purple-700">
              Provide context on why this query requires executive decision-making or budget authorization:
            </p>
            <textarea
              rows={2}
              value={escalationNote}
              onChange={(e) => setEscalationNote(e.target.value)}
              placeholder="e.g. Requires approval for extra budget or cross-departmental coordination..."
              className="w-full text-xs bg-white border border-purple-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEscalateBox(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={escalating}
                className="px-4 py-1.5 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-colors"
              >
                {escalating ? "Escalating..." : "Confirm Escalation"}
              </button>
            </div>
          </div>
        )}

        {/* Initial Query Body */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100">
                <Image
                  src={
                    query.raisedBy?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      query.raisedBy?.name || "User"
                    )}&background=6366f1&color=fff`
                  }
                  alt={query.raisedBy?.name || "Author"}
                  width={24}
                  height={24}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs font-bold text-slate-900">{query.raisedBy?.name}</span>
              <RoleBadge role={query.raisedBy?.role} />
            </div>
            <span className="text-[10px] text-slate-400">
              {new Date(query.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {query.description}
          </p>
        </div>

        {/* Responses Thread */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Thread Responses ({query.responses?.length || 0})
          </h4>

          {query.responses?.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No responses yet. Write a response below.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {query.responses.map((resp, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs ${
                    resp.sender._id === currentUser.userId
                      ? "bg-indigo-50/60 border-indigo-200 ml-6"
                      : "bg-slate-50 border-slate-200 mr-6"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{resp.sender.name}</span>
                      <RoleBadge role={resp.sender.role} />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(resp.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{resp.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleReply} className="flex gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            placeholder="Write a clear resolution or follow-up response..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isSubmitting || !replyMessage.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Reply
          </button>
        </form>
      </div>
    </Modal>
  );
}

export default QueryModal;
