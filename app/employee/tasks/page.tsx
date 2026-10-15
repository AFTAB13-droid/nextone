"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import { Search, Briefcase, CheckCircle2 } from "lucide-react";
import { AuthSession, ITask } from "@/lib/types";

export default function EmployeeTasksPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
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
        <LoadingSpinner fullscreen message="Loading Assigned Tasks" subtext="Fetching assigned sprint objectives and task deliverables" />
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <PortalShell
      user={currentUser}
      title="My Deliverables & Tasks"
      subtitle="Click any task to update progress, submit deliverables for manager review, or participate in discussions"
    >
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 sm:w-72 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">Submitted for Review</option>
            <option value="completed">Completed & Approved</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredTasks.length} of {tasks.length} total tasks
        </span>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
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
