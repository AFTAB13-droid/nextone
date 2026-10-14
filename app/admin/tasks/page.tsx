"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import {
  Plus,
  Search,
  Briefcase,
  List,
  LayoutGrid,
  Calendar,
  Eye,
  GitFork,
  ArrowRight,
  Filter,
} from "lucide-react";
import { AuthSession, ITask } from "@/lib/types";
import Image from "next/image";

export default function AdminTasksPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meRes, tasksRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tasks"),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json();
        setTasks(d.tasks || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (t.taskId && t.taskId.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleOpenDetails = (task: ITask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <PortalShell
      user={currentUser}
      title="Master Task Governance Board"
      subtitle="Executive Lifecycle Control: Assign initiatives, monitor decomposition into subtasks, and audit deliverables"
    >
      {/* Top Filter and Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks, deliverables, or assignees (e.g. UPI, Aarav)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 sm:w-80 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm font-bold"
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review (Awaiting Approval)</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm font-bold"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex items-center gap-3">
          {/* View Toggle: Table vs Cards */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards</span>
            </button>
          </div>

          {/* Assign Task Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 btn-action"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task Initiative</span>
          </button>
        </div>
      </div>

      {/* ================= TASKS: TABLE VIEW OR CARDS VIEW ================= */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Master Task Registry ({filteredTasks.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Row-by-row task governance: Click &apos;Details&apos; to view lifecycle audits, comments, and subtasks
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-white px-3 py-1 rounded-xl border border-slate-200">
              {filteredTasks.filter((t) => t.status === "completed").length} Completed •{" "}
              {filteredTasks.filter((t) => t.status !== "completed").length} Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="px-6 py-4">Task ID & Initiative</th>
                  <th className="px-6 py-4">Designated Assignee</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      No tasks match the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const isOverdue =
                      t.status !== "completed" &&
                      t.status !== "cancelled" &&
                      new Date(t.dueDate) < new Date();

                    return (
                      <tr
                        key={t._id}
                        onClick={() => handleOpenDetails(t)}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      >
                        {/* Task Title & ID */}
                        <td className="px-6 py-4.5 max-w-[280px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-black bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200">
                              {t.taskId || `#${t._id.slice(-6)}`}
                            </span>
                            {t.parentTaskId && (
                              <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg border border-cyan-200 flex items-center gap-1">
                                <GitFork className="w-2.5 h-2.5" />
                                Subtask
                              </span>
                            )}
                          </div>
                          <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-sm line-clamp-1">
                            {t.title}
                          </p>
                          {t.description && (
                            <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                              {t.description}
                            </p>
                          )}
                        </td>

                        {/* Assignee */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                              <Image
                                src={getUserAvatar(t.assignedTo)}
                                alt={t.assignedTo?.name || "User"}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">
                                {t.assignedTo?.name || "Unassigned"}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {t.assignedTo?.designation || "Associate"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4.5">
                          <PriorityBadge priority={t.priority} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4.5">
                          <StatusBadge status={t.status} />
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl ${
                              isOverdue
                                ? "text-rose-700 bg-rose-50 border border-rose-200"
                                : "text-slate-600 bg-slate-50 border border-slate-200/80"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(t.dueDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Progress Bar */}
                        <td className="px-6 py-4.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{t.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                t.status === "completed"
                                  ? "bg-emerald-500"
                                  : t.progressPercentage > 50
                                  ? "bg-gradient-to-r from-indigo-500 to-cyan-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${t.progressPercentage}%` }}
                            />
                          </div>
                        </td>

                        {/* Details Action Button */}
                        <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetails(t)}
                            className="px-4 py-2 text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200/80 shadow-2xs transition-all duration-200 inline-flex items-center gap-1.5 btn-action"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-[32px] p-12 text-center text-slate-400 font-medium border border-slate-200">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">No tasks match the filter</h4>
              <p className="text-xs text-slate-500">Try adjusting your filters or create a new task.</p>
            </div>
          ) : (
            filteredTasks.map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                onClick={(task) => handleOpenDetails(task)}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        currentUser={currentUser}
        onTaskUpdated={(updated) => {
          setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
          setSelectedTask(updated);
          fetchData();
        }}
      />

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUser={currentUser}
        onTaskCreated={() => fetchData()}
      />
    </PortalShell>
  );
}
