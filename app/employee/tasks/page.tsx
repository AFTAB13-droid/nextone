"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import StatCard from "@/components/ui/StatCard";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import Image from "next/image";
import {
  Search,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flame,
  List,
  LayoutGrid,
  Calendar,
  Eye,
  GitFork,
} from "lucide-react";
import { AuthSession, ITask } from "@/lib/types";

export default function EmployeeTasksPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nextone_employee_tasks_view");
      if (saved === "table" || saved === "cards") {
        setViewMode(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetViewMode = (mode: "table" | "cards") => {
    setViewMode(mode);
    try {
      localStorage.setItem("nextone_employee_tasks_view", mode);
    } catch {
      // ignore
    }
  };

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
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner fullscreen message="Loading Assigned Tasks" subtext="Fetching assigned sprint objectives and task deliverables" />
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      (t.taskId && t.taskId.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalTasks = tasks.length;
  const activeCount = tasks.filter((t) => t.status === "in_progress" || t.status === "assigned" || t.status === "pending").length;
  const reviewCount = tasks.filter((t) => t.status === "in_review").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const overdueCount = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "cancelled" &&
      new Date(t.dueDate) < new Date()
  ).length;

  const handleOpenDetails = (task: ITask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <PortalShell
      user={currentUser}
      title="My Deliverables & Tasks"
      subtitle="Click any task to update progress, submit deliverables for manager review, or participate in discussions"
    >
      {/* King-tier Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Assigned Tasks"
          value={totalTasks}
          subtitle={`${activeCount} currently active`}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="In Progress"
          value={activeCount}
          subtitle="Work items underway"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="In Review"
          value={reviewCount}
          subtitle="Awaiting manager approval"
          icon={AlertCircle}
          color="amber"
          badge={reviewCount > 0 ? "Under Review" : undefined}
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueCount}
          subtitle="Past milestone deadline"
          icon={Flame}
          color="rose"
          badge={overdueCount > 0 ? "Urgent Action" : undefined}
        />
      </div>

      {/* Filters and View Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 sm:w-72 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-bold"
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">Submitted for Review</option>
            <option value="completed">Completed & Approved</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* View Toggle: Cards vs Table */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => handleSetViewMode("cards")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => handleSetViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* Main Content: Table or Cards View */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Tasks & Deliverables ({filteredTasks.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any row to open progress inspector and deliverable submissions
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200">
              {completedCount} Completed • {tasks.length - completedCount} In Progress
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="px-6 py-4">Task ID & Title</th>
                  <th className="px-6 py-4">Delegated By</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      No tasks found in this view.
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
                        className={`transition-all duration-200 group cursor-pointer border-b ${
                          isOverdue
                            ? "bg-gradient-to-r from-rose-100/85 via-red-50/70 to-rose-50/40 hover:bg-rose-100/95 border-b-rose-200 border-l-4 border-l-rose-600 shadow-xs"
                            : "border-slate-100 hover:bg-slate-50/70"
                        }`}
                      >
                        {/* Task Title & ID */}
                        <td className="px-6 py-4.5 max-w-[280px]">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                                isOverdue
                                  ? "bg-rose-100 text-rose-800 border-rose-300"
                                  : "bg-slate-100 text-slate-800 border-slate-200"
                              }`}
                            >
                              {isOverdue && <Flame className="w-3 h-3 text-rose-600 animate-pulse" />}
                              {t.taskId || `#${t._id.slice(-6)}`}
                            </span>
                            {isOverdue && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                                Overdue
                              </span>
                            )}
                            {t.parentTaskId && (
                              <span className="text-[9px] font-bold bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200 flex items-center gap-1">
                                <GitFork className="w-2.5 h-2.5" />
                                Subtask
                              </span>
                            )}
                          </div>
                          <p
                            className={`font-black text-sm line-clamp-1 transition-colors ${
                              isOverdue
                                ? "text-rose-950 group-hover:text-rose-700"
                                : "text-slate-900 group-hover:text-indigo-600"
                            }`}
                          >
                            {t.title}
                          </p>
                          {t.description && (
                            <p
                              className={`text-[11px] line-clamp-1 mt-0.5 ${
                                isOverdue ? "text-rose-700/80 font-medium" : "text-slate-400"
                              }`}
                            >
                              {t.description}
                            </p>
                          )}
                        </td>

                        {/* Delegated By */}
                        <td className="px-6 py-4.5">
                          <div className={`text-xs font-semibold ${isOverdue ? "text-rose-900" : "text-slate-700"}`}>
                            {t.assignedBy?.name || "Manager"}
                          </div>
                          <span className={`text-[10px] capitalize block ${isOverdue ? "text-rose-600 font-medium" : "text-slate-400"}`}>
                            {t.assignedBy?.role || "Manager"}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4.5">
                          <PriorityBadge priority={t.priority} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={t.status} />
                            {t.status === "in_review" && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4.5">
                          {isOverdue ? (
                            <div>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 w-fit">
                                <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                <span className="font-mono text-[11px] font-black text-rose-700">
                                  {new Date(t.dueDate).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <span className="text-[9px] font-black text-rose-600 block mt-1 uppercase tracking-wider">
                                Action Overdue
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono text-[11px] text-slate-600">
                                {new Date(t.dueDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Progress */}
                        <td className="px-6 py-4.5 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{t.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOverdue
                                  ? "bg-gradient-to-r from-rose-500 to-red-600"
                                  : t.status === "completed"
                                  ? "bg-emerald-500"
                                  : t.progressPercentage > 50
                                  ? "bg-gradient-to-r from-indigo-500 to-cyan-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${t.progressPercentage}%` }}
                            />
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetails(t)}
                            className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 btn-action ${
                              isOverdue
                                ? "text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-md shadow-rose-600/20"
                                : "text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 shadow-2xs"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
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
        filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">No tasks in this category</h4>
            <p className="text-xs text-slate-500">Check another status or ask your manager if more tasks are queued.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                onClick={(task) => {
                  setSelectedTask(task);
                  setIsTaskModalOpen(true);
                }}
              />
            ))}
          </div>
        )
      )}

      {/* Task Lifecycle Modal */}
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
    </PortalShell>
  );
}
