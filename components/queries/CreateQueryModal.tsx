"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AuthSession, QueryCategory } from "@/lib/types";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { HelpCircle, AlertTriangle, Send, Flame, Clock, Sparkles, FileText } from "lucide-react";

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
      setError("Please provide both query subject and detailed context");
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

  const categoryOptions: CustomSelectOption[] = [
    {
      value: "clarification",
      label: "Specification Clarification",
      badge: "Inquiry",
      description: "Require scope details, architecture rules, or wireframe guidance",
      icon: <HelpCircle className="w-4 h-4 text-cyan-600" />,
    },
    {
      value: "technical",
      label: "Technical Blocker",
      badge: "Blocker",
      description: "Code exception, API timeout, database permissions, or dependency bug",
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    },
    {
      value: "resource",
      label: "Resource / Infrastructure",
      badge: "Infra",
      description: "Server quota, Atlas access, staging environment, or tool license",
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
    },
    {
      value: "other",
      label: "General Operations",
      badge: "General",
      description: "Team coordination, sprint deliverables, or administrative question",
      icon: <FileText className="w-4 h-4 text-slate-600" />,
    },
  ];

  const priorityOptions: CustomSelectOption[] = [
    {
      value: "normal",
      label: "Standard Priority",
      badge: "Normal",
      description: "Standard business hours response turnaround",
      icon: <Clock className="w-4 h-4 text-sky-500" />,
    },
    {
      value: "urgent",
      label: "Urgent Escalation",
      badge: "Fast-Track",
      description: "Critical blocker stalling sprint milestone",
      icon: <Flame className="w-4 h-4 text-rose-500" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise an Operational Query"
      description={
        currentUser.role === "employee"
          ? "Submit query directly to your assigned Operations Manager for triage"
          : "Submit inquiry directly to Executive Admin command"
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-700 flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Query Subject <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. Blocked on Razorpay Production Webhook keys / Need spec clarification on Mumbai deployment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-bold transition-all shadow-inner"
            />
            <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              label="Query Classification Category"
              value={category}
              onChange={(val) => setCategory(val as QueryCategory)}
              options={categoryOptions}
            />
          </div>

          <div>
            <CustomSelect
              label="Urgency & Response Priority"
              value={priority}
              onChange={(val) => setPriority(val as "normal" | "urgent")}
              options={priorityOptions}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Detailed Issue Context & Deliverable Impact <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            placeholder="Explain specifically what issue or dependency is blocking progress, steps attempted, and what resolution or approval is requested..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 btn-action"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? "Submitting Query..." : "Submit Query Ticket"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateQueryModal;
