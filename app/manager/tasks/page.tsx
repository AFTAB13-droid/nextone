"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { Plus, Search, CheckSquare, Clock } from "lucide-react";
import { AuthSession, ITask } from "@/lib/types";

export default function ManagerTasksPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [activeTab, setActiveTab] = useState<"delegated" | "assignedToMe">("delegated");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
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

  // Filter tasks based on tab
  const tabTasks = tasks.filter((t) => {
    if (activeTab === "assignedToMe") {
      return t.assignedTo?._id === currentUser.userId;
    }
    // Delegated to team
    return t.assignedBy?._id === currentUser.userId;
  });

  const filteredTasks = tabTasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedTo?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const assignedToMeCount = tasks.filter((t) => t.assignedTo?._id === currentUser.userId).length;
  const delegatedCount = tasks.filter((t) => t.assignedBy?._id === currentUser.userId).length;
  const reviewCount = tasks.filter(
    (t) => t.assignedBy?._id === currentUser.userId && t.status === "in_review"
  ).length;

  return (
    <PortalShell
      user={currentUser}
      title="Task Operations Hub"
      subtitle="Delegate work to subordinates, review submissions, and complete initiatives assigned by Executive Admin"
    >
      {/* Top Filter and Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("delegated")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "delegated" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600"
              }`}
            >
              <span>Delegated to Team ({delegatedCount})</span>
              {reviewCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("assignedToMe")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "assignedToMe" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600"
              }`}
            >
              Assigned by Admin ({assignedToMeCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 sm:w-64 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review (Needs Approval)</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Delegate Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Delegate Task to Team
        </button>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">No tasks in this view</h4>
          <p className="text-xs text-slate-500">
            {activeTab === "delegated"
              ? "You haven't delegated any tasks matching this filter."
              : "No tasks assigned to you by Admin under this filter."}
          </p>
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
