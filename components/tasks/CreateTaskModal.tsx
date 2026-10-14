"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { AuthSession, IUser, TaskPriority } from "@/lib/types";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { getUserAvatar } from "@/lib/avatarHelper";
import {
  Plus,
  Calendar,
  Tag,
  AlertTriangle,
  Briefcase,
  Clock,
  Flame,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
import Image from "next/image";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthSession;
  onTaskCreated: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  currentUser,
  onTaskCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Set default due date to 5 days in future
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setDueDate(d.toISOString().split("T")[0]);

    // Fetch assignees based on role
    const fetchUsers = async () => {
      try {
        let url = "/api/users";
        if (currentUser.role === "manager") {
          url = "/api/users?team=true";
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const list: IUser[] = data.users || [];
          setEligibleUsers(list);
          if (list.length > 0 && !assignedTo) {
            setAssignedTo(list[0]._id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchUsers();
  }, [isOpen, currentUser, assignedTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo || !dueDate) {
      setError("Please fill in task title, designated assignee, and due date");
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          assignedTo,
          priority,
          dueDate,
          tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create task");
      }

      // Reset
      setTitle("");
      setDescription("");
      setTagsInput("");
      onTaskCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating task";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions: CustomSelectOption[] = [
    {
      value: "urgent",
      label: "Urgent Priority",
      badge: "Critical",
      description: "Highest escalation, immediate execution required",
      icon: <Flame className="w-4 h-4 text-rose-500" />,
    },
    {
      value: "high",
      label: "High Priority",
      badge: "High",
      description: "Priority deliverable with close executive review",
      icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
    },
    {
      value: "medium",
      label: "Medium Priority",
      badge: "Standard",
      description: "Normal sprint timeline and deliverables",
      icon: <Clock className="w-4 h-4 text-sky-500" />,
    },
    {
      value: "low",
      label: "Low Priority",
      badge: "Backlog",
      description: "Secondary initiatives or exploratory scope",
      icon: <span className="w-2 h-2 rounded-full bg-slate-400" />,
    },
  ];

  const assigneeOptions: CustomSelectOption[] = eligibleUsers.map((u) => ({
    value: u._id,
    label: u.name,
    badge: u.role === "manager" ? "Manager" : "Associate",
    description: `${u.designation || "Specialist"} • ${u.department || "Operations"} (${u.email})`,
    icon: (
      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
        <Image
          src={getUserAvatar(u)}
          alt={u.name}
          width={24}
          height={24}
          className="w-full h-full object-cover"
          unoptimized
        />
      </div>
    ),
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Enterprise Task"
      description={
        currentUser.role === "admin"
          ? "Executive delegation: Assign organization initiatives to any Manager or Associate"
          : "Supervisory delegation: Assign tasks to team members under your reporting line"
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

        {/* Task Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Task Initiative Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. Implement Razorpay Payment Gateway & Webhook Reconciliation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-bold transition-all shadow-inner"
            />
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Assignee Custom Dropdown */}
        <div>
          <CustomSelect
            label="Designate Assignee (Responsible Owner)"
            required
            value={assignedTo}
            onChange={(val) => setAssignedTo(val)}
            options={assigneeOptions}
            placeholder="Select a designated team member..."
            searchable
          />
          {eligibleUsers.length === 0 && (
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              No eligible team members found to assign. Ensure users have been provisioned.
            </p>
          )}
        </div>

        {/* Priority & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              label="Priority Level"
              value={priority}
              onChange={(val) => setPriority(val as TaskPriority)}
              options={priorityOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category Tags (Comma-separated)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Backend, UPI-Gateway, Sprint-4, High-Priority"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
            />
            <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Task Description & Guidelines
          </label>
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Outline project objectives, acceptance criteria, deliverables, and architecture links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Actions */}
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
            <Plus className="w-4 h-4" />
            <span>{loading ? "Assigning..." : "Assign Task Initiative"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateTaskModal;
