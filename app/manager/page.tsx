"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import StatCard from "@/components/ui/StatCard";
import TaskCard from "@/components/tasks/TaskCard";
import TaskModal from "@/components/tasks/TaskModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import CreateQueryModal from "@/components/queries/CreateQueryModal";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  HelpCircle,
  Plus,
  ArrowRight,
  Send,
  AlertTriangle,
} from "lucide-react";
import { AuthSession, ITask, IUser, IQuery } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export default function ManagerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [teamMembers, setTeamMembers] = useState<IUser[]>([]);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateQueryOpen, setIsCreateQueryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meRes, tasksRes, teamRes, queriesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tasks"),
        fetch("/api/users?team=true"),
        fetch("/api/queries"),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (tasksRes.ok) {
        const d = await tasksRes.json();
        setTasks(d.tasks || []);
      }
      if (teamRes.ok) {
        const d = await teamRes.json();
        setTeamMembers(d.users || []);
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

  // Tasks assigned directly to this manager by Admin
  const tasksForManager = tasks.filter((t) => t.assignedTo?._id === currentUser.userId);

  // Tasks delegated by this manager to employees
  const delegatedTasks = tasks.filter((t) => t.assignedBy?._id === currentUser.userId);

  // Submissions awaiting manager review
  const awaitingReview = delegatedTasks.filter((t) => t.status === "in_review");

  // Open queries from employees
  const openTeamQueries = queries.filter(
    (q) => q.assignedTo?._id === currentUser.userId && q.status !== "resolved"
  );

  return (
    <PortalShell
      user={currentUser}
      title="Manager Workspace"
      subtitle="Supervise subordinate team members, delegate tasks, approve deliverables, and triage queries"
    >
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Hello, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            You are supervising {teamMembers.length} team members with {delegatedTasks.length} delegated tasks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateQueryOpen(true)}
            className="px-4 py-2.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-purple-600" />
            Ask Executive Admin
          </button>
          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Delegate Task to Team
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Team Members"
          value={teamMembers.length}
          subtitle="Assigned to your supervision"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Delegated Tasks"
          value={delegatedTasks.length}
          subtitle={`${delegatedTasks.filter((t) => t.status === "completed").length} Completed`}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Awaiting Your Review"
          value={awaitingReview.length}
          subtitle="Employee deliverables ready to verify"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Team Queries"
          value={openTeamQueries.length}
          subtitle="Questions & blockers needing help"
          icon={HelpCircle}
          color="purple"
        />
      </div>

      {/* Urgent: Tasks Assigned by Admin to Manager */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tasks Assigned to You by Executive Admin ({tasksForManager.length})
            </h3>
            <p className="text-xs text-slate-500">High-level initiatives assigned to you</p>
          </div>
          <Link
            href="/manager/tasks"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tasksForManager.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No direct tasks assigned to you by Admin right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksForManager.map((t) => (
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

      {/* Team Roster & Tasks Delegated to Subordinates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Team Members */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">My Team Roster</h3>
            <Link
              href="/manager/team"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Roster <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {teamMembers.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No employees currently assigned to your team by Admin.
              </div>
            ) : (
              teamMembers.map((emp) => {
                const empTasks = delegatedTasks.filter(
                  (t) => t.assignedTo?._id === emp._id && t.status !== "completed"
                );

                return (
                  <div
                    key={emp._id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0">
                        <Image
                          src={
                            emp.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              emp.name
                            )}&background=059669&color=fff`
                          }
                          alt={emp.name}
                          width={36}
                          height={36}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{emp.designation}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                      {empTasks.length} active
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Delegated Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Tasks Delegated to Team ({delegatedTasks.length})
            </h3>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              + Delegate New
            </button>
          </div>

          {delegatedTasks.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No tasks delegated yet. Click &quot;Delegate Task to Team&quot; above to assign work to your employees.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {delegatedTasks.slice(0, 4).map((t) => (
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

      <CreateQueryModal
        isOpen={isCreateQueryOpen}
        onClose={() => setIsCreateQueryOpen(false)}
        currentUser={currentUser}
        onQueryCreated={() => fetchData()}
      />
    </PortalShell>
  );
}
