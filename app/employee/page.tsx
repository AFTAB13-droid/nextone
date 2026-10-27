"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import StatCard from "@/components/ui/StatCard";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import CreateQueryModal from "@/components/queries/CreateQueryModal";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Send,
  Calendar,
  Flame,
  Target as TargetIcon,
  Inbox,
} from "lucide-react";
import { AuthSession, ITask, IUser, IQuery, ITarget } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function EmployeeDashboardPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [managerUser, setManagerUser] = useState<IUser | null>(null);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [todayTarget, setTodayTarget] = useState<ITarget | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meRes, tasksRes, queriesRes, targetRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tasks"),
        fetch("/api/queries"),
        fetch("/api/targets"),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
        if (d.user.managerId) {
          const mgrId = typeof d.user.managerId === "object" ? d.user.managerId._id : d.user.managerId;
          const uRes = await fetch(`/api/users/${mgrId}`);
          if (uRes.ok) {
            const ud = await uRes.json();
            setManagerUser(ud.user);
          }
        }
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json();
        setTasks(d.tasks || []);
      }
      if (queriesRes.ok) {
        const d = await queriesRes.json();
        setQueries(d.queries || []);
      }
      if (targetRes.ok) {
        const d = await targetRes.json();
        setTodayTarget(d.target || null);
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
        <LoadingSpinner fullscreen message="Loading Workspace" subtext="Syncing personal mission tasks, daily goals, and supervisor communications" />
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const inReviewTasks = tasks.filter((t) => t.status === "in_review");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const openQueries = queries.filter((q) => q.status !== "resolved");
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "cancelled" &&
      new Date(t.dueDate) < new Date()
  );

  return (
    <PortalShell
      user={currentUser}
      title="Employee Workspace"
      subtitle="Track assigned deliverables, update work progress, and consult your reporting manager"
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            You have {activeTasks.length} active tasks assigned to you.
          </p>
        </div>

        <button
          onClick={() => setIsQueryModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          Ask Reporting Manager
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Deliverables"
          value={activeTasks.length}
          subtitle="Work items currently in progress"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Submitted for Review"
          value={inReviewTasks.length}
          subtitle="Awaiting manager verification"
          icon={Clock}
          color="amber"
          badge={inReviewTasks.length > 0 ? "Under Review" : undefined}
        />
        <StatCard
          title="Completed Deliverables"
          value={completedTasks.length}
          subtitle="Successfully approved & closed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title={overdueTasks.length > 0 ? "Overdue Tasks" : "My Open Queries"}
          value={overdueTasks.length > 0 ? overdueTasks.length : openQueries.length}
          subtitle={
            overdueTasks.length > 0
              ? "Requires urgent completion"
              : "Questions submitted to manager"
          }
          icon={overdueTasks.length > 0 ? Flame : HelpCircle}
          color={overdueTasks.length > 0 ? "rose" : "purple"}
          badge={overdueTasks.length > 0 ? "Urgent Action" : undefined}
        />
      </div>

      {/* Today's Target Highlight Banner */}
      <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                Today&apos;s Target Commitment
              </span>
              {todayTarget ? (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    todayTarget.status === "achieved"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {todayTarget.status === "achieved" ? "Achieved" : "In Progress"}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Not Set Today
                </span>
              )}
            </div>
            <p className="text-sm font-black text-slate-900 mt-1">
              {todayTarget
                ? todayTarget.targetText
                : "You have not set today's daily target commitment yet."}
            </p>
            {todayTarget?.progressNotes && (
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                {todayTarget.progressNotes}
              </p>
            )}
          </div>
        </div>

        <Link
          href="/employee/targets"
          className="px-4 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200/90 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>{todayTarget ? "Manage Daily Target" : "Set Today's Target"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2-Column: Reporting Manager Card + My Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Supervisor Info */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Reporting Supervisor</h3>

          {managerUser ? (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/60 to-white border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-indigo-200 shrink-0">
                  <Image
                    src={
                      managerUser.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        managerUser.name
                      )}&background=4f46e5&color=fff`
                    }
                    alt={managerUser.name}
                    width={48}
                    height={48}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full inline-block mb-1">
                    Your Manager
                  </span>
                  <p className="text-sm font-bold text-slate-900 truncate">{managerUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{managerUser.designation}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-indigo-100 text-xs text-slate-600 space-y-1.5">
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold">{managerUser.department}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-[11px] text-indigo-700">{managerUser.email}</span>
                </p>
              </div>

              <button
                onClick={() => setIsQueryModalOpen(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Ask Manager a Question
              </button>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No manager assigned by Admin yet. All tasks are assigned directly by Executive Admin.</p>
            </div>
          )}
        </div>

        {/* Right: My Active Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              My Current Deliverables ({activeTasks.length})
            </h3>
            <Link
              href="/employee/tasks"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Deliverables <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeTasks.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="font-bold text-slate-700 text-sm">All caught up!</p>
              <p className="mt-1">You have no active pending tasks right now. Great job!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeTasks.slice(0, 4).map((t) => (
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

      <CreateQueryModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        currentUser={currentUser}
        onQueryCreated={() => fetchData()}
      />
    </PortalShell>
  );
}
