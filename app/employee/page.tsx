"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
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
} from "lucide-react";
import { AuthSession, ITask, IUser, IQuery } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function EmployeeDashboardPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [managerUser, setManagerUser] = useState<IUser | null>(null);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meRes, tasksRes, queriesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tasks"),
        fetch("/api/queries"),
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

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const inReviewTasks = tasks.filter((t) => t.status === "in_review");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const openQueries = queries.filter((q) => q.status !== "resolved");

  return (
    <PortalShell
      user={currentUser}
      title="Employee Workspace"
      subtitle="Track your assigned deliverables, update work progress, and consult your designated manager"
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            You have {activeTasks.length} active tasks assigned to you.
          </p>
        </div>

        <button
          onClick={() => setIsQueryModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          Ask Reporting Manager
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        />
        <StatCard
          title="Completed Deliverables"
          value={completedTasks.length}
          subtitle="Successfully approved & closed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="My Open Queries"
          value={openQueries.length}
          subtitle="Questions submitted to manager"
          icon={HelpCircle}
          color="purple"
        />
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
