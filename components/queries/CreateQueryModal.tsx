"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AuthSession, QueryCategory } from "@/lib/types";
import { HelpCircle, AlertTriangle, Send } from "lucide-react";

interface CreateQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthSession;
  onQueryCreated: () => void;
}

export function CreateQueryModal({
  isOpen,
  onClose,
  currentUser,
  onQueryCreated,
}: CreateQueryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QueryCategory>("clarification");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please provide both title and description");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to raise query");
      }

      setTitle("");
      setDescription("");
      onQueryCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error raising query";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise a Query / Ticket"
      description={
        currentUser.role === "employee"
          ? "Ask your reporting Manager for guidance, unblockers, or clarification"
          : "Raise operational, budget, or policy inquiries directly to Executive Admin"
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Query Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Blocked on staging API credentials / Need spec clarification"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QueryCategory)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="clarification">Clarification</option>
              <option value="technical">Technical Blocker</option>
              <option value="resource">Resource / Budget</option>
              <option value="other">Other / General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "normal" | "urgent")}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent (Requires fast turnaround)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Query Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Explain what is blocking you, what steps you tried, or what approval you require..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? "Submitting..." : "Submit Query"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateQueryModal;
