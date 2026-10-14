"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { AuthSession, ITask, IUser, TaskPriority } from "@/lib/types";
import { GitFork, Calendar, User, AlertCircle, CheckCircle2 } from "lucide-react";

interface SplitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentTask: ITask | null;
  currentUser: AuthSession;
  onSubtaskCreated: (newSubtask: ITask) => void;
}

export function SplitTaskModal({
  isOpen,
  onClose,
  parentTask,
  currentUser,
  onSubtaskCreated,
}: SplitTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [subordinates, setSubordinates] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Default due date to parent task due date or 3 days
    if (parentTask?.dueDate) {
      const d = new Date(parentTask.dueDate);
      setDueDate(d.toISOString().split("T")[0]);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split("T")[0]);
    }

    // Fetch subordinates (employees assigned to this manager)
    const fetchSubordinates = async () => {
      try {
        const res = await fetch("/api/users?role=employee");
        if (res.ok) {
          const data = await res.json();
          const list: IUser[] = data.users || [];
          setSubordinates(list);
          if (list.length > 0 && !assignedTo) {
            setAssignedTo(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSubordinates();
  }, [isOpen, parentTask, assignedTo]);

  if (!parentTask) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo || !dueDate) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      const res = await fetch(`/api/tasks/${parentTask._id}/split`, {
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
        throw new Error(data.error || "Failed to split task");
      }

      onSubtaskCreated(data.task);
      onClose();
      // Reset
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error splitting task";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const parentIdFormatted = parentTask.taskId || `#${parentTask._id.slice(-6)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Split Task & Delegate Subtask"
      description={`Decompose initiative ${parentIdFormatted} into actionable sub-deliverables`}
      maxWidth="lg"
    >
      {/* Parent Task Context Banner */}
      <div className="mb-5 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <GitFork className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700">
              Parent: {parentIdFormatted}
            </span>
            <span className="text-xs font-bold text-slate-800 truncate">{parentTask.title}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
            Assigned by: {parentTask.assignedBy?.name} (Admin)
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Subtask Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Design responsive UI mockup for checkout flow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Subtask Instructions / Deliverable Requirements
          </label>
          <textarea
            rows={3}
            placeholder="Specific deliverables, references, links or acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Delegate To Employee <span className="text-rose-500">*</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subordinates.length === 0 ? (
                <option value="">No direct report employees available</option>
              ) : (
                subordinates.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} ({sub.designation || "Employee"})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Subtask Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="frontend, api, bugfix"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || subordinates.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <GitFork className="w-3.5 h-3.5" />
            {loading ? "Delegating..." : "Create & Delegate Subtask"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SplitTaskModal;
