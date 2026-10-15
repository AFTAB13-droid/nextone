"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import StatCard from "@/components/ui/StatCard";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import CreateUserModal from "@/components/users/CreateUserModal";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Plus,
  UserPlus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AuthSession, ITask, IUser, IQuery } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    in_review: 0,
    completed: 0,
    blocked: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meRes, tasksRes, usersRes, queriesRes, metricsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tasks"),
        fetch("/api/users"),
        fetch("/api/queries"),
        fetch("/api/tasks/metrics"),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json();
        setTasks(d.tasks || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
      if (queriesRes.ok) {
        const d = await queriesRes.json();
        setQueries(d.queries || []);
      }
      if (metricsRes.ok) {
        const d = await metricsRes.json();
        if (d.metrics) setMetrics(d.metrics);
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
        <LoadingSpinner fullscreen message="Loading Executive Dashboard" subtext="Aggregating company metrics, operational KPIs, and active sprints" />
      </div>
    );
  }

  const managers = users.filter((u) => u.role === "manager");
  const employees = users.filter((u) => u.role === "employee");
  const escalatedQueries = queries.filter((q) => q.escalatedTo && q.status !== "resolved");

  return (
    <PortalShell
      user={currentUser}
      title="Executive Overview"
      subtitle="Complete organizational visibility into team hierarchy, tasks lifecycle, and escalations"
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status across {managers.length} managers, {employees.length} employees, and {tasks.length} total tasks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateUserOpen(true)}
            className="px-4 py-2.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Add User Account
          </button>
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Assign Company Task
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Workforce"
          value={users.length}
          subtitle={`${managers.length} Managers • ${employees.length} Employees`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active Tasks"
          value={metrics.in_progress + metrics.pending}
          subtitle={`${metrics.pending} Pending • ${metrics.in_progress} In Progress`}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          subtitle={`${metrics.completed} Tasks Finished & Approved`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Needs Attention"
          value={metrics.overdue + escalatedQueries.length}
          subtitle={`${metrics.overdue} Overdue • ${escalatedQueries.length} Escalated Queries`}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Task Lifecycle Breakdown Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Task Lifecycle Distribution</h3>
            <p className="text-xs text-slate-500">Real-time status breakdown across all company tasks</p>
          </div>
          <Link
            href="/admin/tasks"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Master Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Visual Progress Stacked Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          {metrics.completed > 0 && (
            <div
              className="h-full bg-emerald-500 rounded-sm transition-all"
              style={{ width: `${(metrics.completed / (metrics.total || 1)) * 100}%` }}
              title={`Completed: ${metrics.completed}`}
            />
          )}
          {metrics.in_review > 0 && (
            <div
              className="h-full bg-indigo-500 rounded-sm transition-all"
              style={{ width: `${(metrics.in_review / (metrics.total || 1)) * 100}%` }}
              title={`In Review: ${metrics.in_review}`}
            />
          )}
          {metrics.in_progress > 0 && (
            <div
              className="h-full bg-sky-500 rounded-sm transition-all"
              style={{ width: `${(metrics.in_progress / (metrics.total || 1)) * 100}%` }}
              title={`In Progress: ${metrics.in_progress}`}
            />
          )}
          {metrics.pending > 0 && (
            <div
              className="h-full bg-amber-400 rounded-sm transition-all"
              style={{ width: `${(metrics.pending / (metrics.total || 1)) * 100}%` }}
              title={`Pending: ${metrics.pending}`}
            />
          )}
          {metrics.blocked > 0 && (
            <div
              className="h-full bg-rose-500 rounded-sm transition-all"
              style={{ width: `${(metrics.blocked / (metrics.total || 1)) * 100}%` }}
              title={`Blocked: ${metrics.blocked}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Completed ({metrics.completed})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-slate-600">In Review ({metrics.in_review})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-slate-600">In Progress ({metrics.in_progress})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-slate-600">Pending ({metrics.pending})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-600">Blocked ({metrics.blocked})</span>
          </div>
        </div>
      </div>

      {/* 2-Column Content: Hierarchy Quick View + High Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Organization Hierarchy Overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Managers & Teams</h3>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {managers.map((mgr) => {
              const teamSubs = employees.filter((e) => {
                const mid = typeof e.managerId === "object" && e.managerId ? e.managerId._id : e.managerId;
                return mid === mgr._id;
              });

              return (
                <div
                  key={mgr._id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={
                          mgr.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            mgr.name
                          )}&background=4f46e5&color=fff`
                        }
                        alt={mgr.name}
                        width={40}
                        height={40}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{mgr.name}</p>
                      <p className="text-[11px] text-slate-500">{mgr.designation} • {mgr.department}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Supervised Team ({teamSubs.length})
                      </span>
                    </div>
                    {teamSubs.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No employees assigned yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {teamSubs.map((sub) => (
                          <span
                            key={sub._id}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Urgent & In-Review Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Active Company Workboard ({tasks.length})
            </h3>
            <span className="text-xs text-slate-500">Click any card to inspect lifecycle</span>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No tasks created yet.</p>
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Create First Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tasks.slice(0, 6).map((t) => (
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
        </div>
      </div>

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
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        currentUser={currentUser}
        onTaskCreated={() => fetchData()}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onUserCreated={() => fetchData()}
      />
    </PortalShell>
  );
}
