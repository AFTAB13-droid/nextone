"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import Image from "next/image";
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  List,
  LayoutGrid,
  Eye,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GitFork,
  Calendar,
  Filter,
  Users,
  Shield,
  Flame,
} from "lucide-react";
import { AuthSession, ITask } from "@/lib/types";

// Helper to safely extract string ID from populated object or string ID
const getEntityId = (entity: any): string => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  if (entity._id) return entity._id.toString();
  if (entity.userId) return entity.userId.toString();
  if (entity.id) return entity.id.toString();
  return "";
};

export default function ManagerTasksPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [activeTab, setActiveTab] = useState<"delegated" | "assignedToMe" | "all">("delegated");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [onlyNeedsReview, setOnlyNeedsReview] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nextone_manager_tasks_view");
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
      localStorage.setItem("nextone_manager_tasks_view", mode);
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

  const currentUserId = useMemo(() => {
    return (
      (currentUser as any)?._id?.toString() ||
      (currentUser as any)?.userId?.toString() ||
      ""
    );
  }, [currentUser]);

  // Tab counts
  const delegatedCount = useMemo(() => {
    if (!currentUserId) return 0;
    return tasks.filter((t) => getEntityId(t.assignedBy) === currentUserId).length;
  }, [tasks, currentUserId]);

  const assignedToMeCount = useMemo(() => {
    if (!currentUserId) return 0;
    return tasks.filter((t) => getEntityId(t.assignedTo) === currentUserId).length;
  }, [tasks, currentUserId]);

  const reviewCount = useMemo(() => {
    if (!currentUserId) return 0;
    return tasks.filter(
      (t) => getEntityId(t.assignedBy) === currentUserId && t.status === "in_review"
    ).length;
  }, [tasks, currentUserId]);

  // Filter tasks based on activeTab
  const tabTasks = useMemo(() => {
    if (!currentUserId) return [];
    if (activeTab === "assignedToMe") {
      return tasks.filter((t) => getEntityId(t.assignedTo) === currentUserId);
    }
    if (activeTab === "delegated") {
      return tasks.filter((t) => getEntityId(t.assignedBy) === currentUserId);
    }
    // "all" tab: all tasks visible to this manager
    return tasks;
  }, [tasks, activeTab, currentUserId]);

  // Search & filter results
  const filteredTasks = useMemo(() => {
    return tabTasks.filter((t) => {
      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" ? true : t.priority === priorityFilter;
      const matchesReview = onlyNeedsReview ? t.status === "in_review" : true;

      const assigneeName = t.assignedTo?.name || "";
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        assigneeName.toLowerCase().includes(search.toLowerCase()) ||
        (t.taskId && t.taskId.toLowerCase().includes(search.toLowerCase()));

      return matchesStatus && matchesPriority && matchesReview && matchesSearch;
    });
  }, [tabTasks, statusFilter, priorityFilter, onlyNeedsReview, search]);

  const handleOpenDetails = (task: ITask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner
          fullscreen
          message="Loading Tasks & Delegation"
          subtext="Fetching assigned sprint tasks, deliverables, and team delegation board"
        />
      </div>
    );
  }

  // Summary Metrics
  const activeCount = tabTasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tabTasks.filter((t) => t.status === "completed").length;
  const overdueCount = tabTasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "cancelled" &&
      new Date(t.dueDate) < new Date()
  ).length;

  return (
    <PortalShell
      user={currentUser}
      title="Task Operations Hub"
      subtitle="Delegate work to subordinates, review submissions, and track initiatives assigned by Executive Admin"
    >
      {/* Top Segmented Tabs and Main Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Main Segmented Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("delegated")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "delegated"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Delegated to Team ({delegatedCount})</span>
            {reviewCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse ring-2 ring-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("assignedToMe")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "assignedToMe"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Assigned by Admin ({assignedToMeCount})</span>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "all"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All ({tasks.length})</span>
          </button>
        </div>

        {/* Action Button & View Switcher */}
        <div className="flex items-center gap-3">
          {/* Table vs Cards Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => handleSetViewMode("cards")}
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
            <button
              onClick={() => handleSetViewMode("table")}
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
          </div>

          {/* Delegate Task Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 btn-action"
          >
            <Plus className="w-4 h-4" />
            <span>Delegate Task to Team</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Active Sprint
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-950 mt-1">{activeCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">In progress work</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
              Needs Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{reviewCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Awaiting manager sign-off</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Verified deliverables</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
              Overdue
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{overdueCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Past target deadline</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks, deliverables, or assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 sm:w-72 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm font-bold cursor-pointer"
          >
            <option value="all">All Statuses ({tabTasks.length})</option>
            <option value="in_review">In Review (Needs Approval)</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm font-bold cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Review Filter Button */}
          {reviewCount > 0 && (
            <button
              onClick={() => setOnlyNeedsReview(!onlyNeedsReview)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                onlyNeedsReview
                  ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Needs Approval ({reviewCount})</span>
            </button>
          )}
        </div>

        {/* Showing Count */}
        <div className="text-xs font-mono font-bold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs">
          Showing {filteredTasks.length} of {tabTasks.length} tasks
        </div>
      </div>

      {/* ================= DUAL VIEW: TABLE OR CARDS ================= */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                {activeTab === "delegated"
                  ? "Delegated Sprint Tasks Registry"
                  : activeTab === "assignedToMe"
                  ? "Executive Initiatives Assigned to Manager"
                  : "Department Task Registry"}{" "}
                ({filteredTasks.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any row or &apos;Inspect&apos; to view lifecycle details, review work, or split tasks
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              {filteredTasks.filter((t) => t.status === "in_review").length} Awaiting Approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="px-6 py-4">Task ID & Title</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Delegated By</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center text-slate-400 font-medium">
                      <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="font-bold text-slate-700">No tasks found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeTab === "delegated"
                          ? "You haven't delegated any tasks matching this filter."
                          : "No tasks assigned to you under this filter."}
                      </p>
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
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                              {t.taskId || `#${t._id.slice(-6)}`}
                            </span>
                            {t.parentTaskId && (
                              <span className="text-[9px] font-bold bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded border border-cyan-200 flex items-center gap-1">
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

                        {/* Delegated By */}
                        <td className="px-6 py-4.5">
                          <div className="text-xs font-semibold text-slate-700">
                            {t.assignedBy?.name || "Executive Admin"}
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize block">
                            {t.assignedBy?.role || "Admin"}
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
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span
                              className={`font-mono text-[11px] ${
                                isOverdue ? "text-rose-600 font-bold" : "text-slate-600"
                              }`}
                            >
                              {new Date(t.dueDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {isOverdue && (
                            <span className="text-[9px] font-extrabold text-rose-600 block mt-0.5">
                              Overdue
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenDetails(t)}
                            className="px-3.5 py-2 text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200/80 shadow-2xs transition-all duration-200 inline-flex items-center gap-1.5 btn-action"
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
        <div>
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-[28px] p-12 border border-slate-200/90 text-center text-slate-400">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">No tasks in this view</h4>
              <p className="text-xs text-slate-500">
                {activeTab === "delegated"
                  ? "You haven't delegated any tasks matching this filter."
                  : "No tasks assigned to you under this filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map((t) => (
                <TaskCard
                  key={t._id}
                  task={t}
                  onClick={(task) => handleOpenDetails(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Inspection / Lifecycle Modal */}
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

      {/* Delegate Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUser={currentUser}
        onTaskCreated={() => fetchData()}
      />
    </PortalShell>
  );
}
