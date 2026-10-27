"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
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
  Clock,
  AlertCircle,
  CheckCircle2,
  Flame,
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
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner fullscreen message="Loading Master Task Board" subtext="Fetching company missions, sprint milestones, and progress telemetry" />
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

  const totalTasks = tasks.length;
  const activeCount = tasks.filter((t) => t.status === "in_progress" || t.status === "assigned").length;
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
      title="Master Task Governance Board"
      subtitle="Executive Lifecycle Control: Assign initiatives, monitor decomposition into subtasks, and audit deliverables"
    >
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Initiatives"
          value={totalTasks}
          subtitle={`${activeCount} currently active`}
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Active Sprint"
          value={activeCount}
          subtitle="In flight work streams"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Needs Review"
          value={reviewCount}
          subtitle="Pending sign-off & audit"
          icon={AlertCircle}
          color="amber"
          badge={reviewCount > 0 ? "Requires Review" : undefined}
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
                        className={`transition-colors duration-150 group cursor-pointer border-b ${
                          isOverdue
                            ? "bg-rose-50/30 hover:bg-rose-50/60 border-b-rose-100 border-l-2 border-l-rose-500"
                            : "border-slate-100 hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Task Title & ID */}
                        <td className="px-5 py-3.5 max-w-[280px]">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                isOverdue
                                  ? "bg-rose-100/80 text-rose-800 border-rose-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {t.taskId || `#${t._id.slice(-6)}`}
                            </span>
                            {isOverdue && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded-md">
                                Overdue
                              </span>
                            )}
                            {t.parentTaskId && (
                              <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md border border-cyan-200/70 flex items-center gap-1">
                                <GitFork className="w-2.5 h-2.5" />
                                Subtask
                              </span>
                            )}
                          </div>
                          <p
                            className={`font-semibold text-sm line-clamp-1 transition-colors ${
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
                                isOverdue ? "text-rose-800/80" : "text-slate-400"
                              }`}
                            >
                              {t.description}
                            </p>
                          )}
                        </td>

                        {/* Assignee */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl overflow-hidden shrink-0 ${
                                isOverdue
                                  ? "ring-2 ring-rose-400/60 bg-rose-50"
                                  : "bg-slate-100 ring-1 ring-slate-200"
                              }`}
                            >
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
                              <p
                                className={`font-bold truncate ${
                                  isOverdue ? "text-rose-950" : "text-slate-800"
                                }`}
                              >
                                {t.assignedTo?.name || "Unassigned"}
                              </p>
                              <p
                                className={`text-[10px] truncate ${
                                  isOverdue ? "text-rose-600 font-medium" : "text-slate-400"
                                }`}
                              >
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
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${
                              isOverdue
                                ? "text-rose-700 bg-rose-100/70 border-rose-200"
                                : "text-slate-600 bg-slate-50 border-slate-200/80"
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
                        <td className="px-5 py-3.5 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                            <span>{t.progressPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOverdue
                                  ? "bg-rose-500"
                                  : t.status === "completed"
                                  ? "bg-emerald-500"
                                  : t.progressPercentage > 50
                                  ? "bg-indigo-600"
                                  : "bg-sky-500"
                              }`}
                              style={{ width: `${t.progressPercentage}%` }}
                            />
                          </div>
                        </td>

                        {/* Details Action Button */}
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetails(t)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200/70 shadow-2xs"
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
