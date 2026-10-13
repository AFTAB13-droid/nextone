"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, PriorityBadge, RoleBadge } from "@/components/ui/Badge";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  MessageSquare,
  History,
  Send,
  AlertCircle,
  Paperclip,
  ArrowRight,
} from "lucide-react";
import { ITask, TaskStatus, AuthSession } from "@/lib/types";
import Image from "next/image";

interface TaskModalProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthSession;
  onTaskUpdated: (updatedTask: ITask) => void;
}

export function TaskModal({
  task,
  isOpen,
  onClose,
  currentUser,
  onTaskUpdated,
}: TaskModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "comments">("overview");
  const [newStatus, setNewStatus] = useState<TaskStatus>(task?.status || "pending");
  const [statusNote, setStatusNote] = useState<string>("");
  const [progress, setProgress] = useState<number>(task?.progressPercentage || 0);
  const [newComment, setNewComment] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isCommenting, setIsCommenting] = useState<boolean>(false);

  // Sync state if task prop changes
  React.useEffect(() => {
    if (task) {
      setNewStatus(task.status);
      setProgress(task.progressPercentage);
      setStatusNote("");
      setNewComment("");
    }
  }, [task]);

  if (!task) return null;

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
          progressPercentage: progress,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onTaskUpdated(data.task);
        setStatusNote("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newComment }),
      });
      if (res.ok) {
        const data = await res.json();
        onTaskUpdated(data.task);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      description={`Task ID: #${task._id.slice(-6)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Task Lifecycle & Details
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            Activity Timeline ({task.activityLogs?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "comments"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments ({task.comments?.length || 0})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & STATUS CONTROL */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
              <div>
                <p className="text-slate-400 font-semibold mb-1">Status</p>
                <StatusBadge status={task.status} />
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-1">Priority</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-1">Due Date</p>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {new Date(task.dueDate).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-1">Progress</p>
                <p className="font-bold text-indigo-600">{task.progressPercentage}% Complete</p>
              </div>
            </div>

            {/* People Involved */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={task.assignedBy?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedBy?.name || "A")}&background=4f46e5&color=fff`}
                    alt={task.assignedBy?.name || "Assigner"}
                    width={32}
                    height={32}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned By</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{task.assignedBy?.name}</p>
                  <p className="text-[10px] text-slate-500">{task.assignedBy?.designation || task.assignedBy?.role}</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={task.assignedTo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignedTo?.name || "U")}&background=059669&color=fff`}
                    alt={task.assignedTo?.name || "Assignee"}
                    width={32}
                    height={32}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Assignee (Working)</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{task.assignedTo?.name}</p>
                  <p className="text-[10px] text-slate-500">{task.assignedTo?.designation || task.assignedTo?.role}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h4>
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/50 whitespace-pre-wrap">
                {task.description || "No description provided."}
              </div>
            </div>

            {/* UPDATE LIFECYCLE FORM */}
            <form onSubmit={handleStatusSubmit} className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                Update Lifecycle Stage
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Transition</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending (Not Started)</option>
                    <option value="in_progress">In Progress (Active Work)</option>
                    <option value="in_review">In Review (Submit for Approval)</option>
                    <option value="completed">Completed (Approved)</option>
                    <option value="blocked">Blocked (Facing Issue)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Progress: <span className="font-bold text-indigo-600">{progress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-indigo-600 mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transition Note / Deliverable Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Code pushed to staging branch, ready for review..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Status & Update Logs"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: ACTIVITY TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audit & Transition Trail
            </h4>

            {task.activityLogs?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No logs recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {task.activityLogs?.map((log, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2 text-[11px] text-slate-500">
                        <span>By {log.by.name}</span>
                        <RoleBadge role={log.by.role} />
                      </div>
                      {log.note && (
                        <p className="p-2 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMMENTS */}
        {activeTab === "comments" && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {task.comments?.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-1 stroke-1 opacity-50" />
                  <p className="text-xs">No discussion comments yet. Start the conversation!</p>
                </div>
              ) : (
                task.comments?.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.author.name}</span>
                        <RoleBadge role={c.author.role} />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment or update for the team..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isCommenting || !newComment.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TaskModal;
