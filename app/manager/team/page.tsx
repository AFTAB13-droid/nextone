"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { UserProfileDrawer } from "@/components/users/UserProfileDrawer";
import { getUserAvatar } from "@/lib/avatarHelper";
import { RoleBadge } from "@/components/ui/Badge";
import {
  Users,
  Mail,
  Phone,
  Briefcase,
  Plus,
  CheckCircle2,
  Search,
  LayoutGrid,
  List,
  Eye,
  Clock,
  TrendingUp,
  Sparkles,
  Shield,
  Building,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { AuthSession, IUser, ITask } from "@/lib/types";
import Image from "next/image";

export default function ManagerTeamPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [teamMembers, setTeamMembers] = useState<IUser[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedMemberForTask, setSelectedMemberForTask] = useState<IUser | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<IUser | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // View Options: Table vs Cards (default cards, persistent in localStorage)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [workloadFilter, setWorkloadFilter] = useState<"all" | "active" | "available">("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nextone_manager_team_view");
      if (saved === "table" || saved === "cards") {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleSetViewMode = (mode: "cards" | "table") => {
    setViewMode(mode);
    try {
      localStorage.setItem("nextone_manager_team_view", mode);
    } catch {}
  };

  const fetchData = async () => {
    try {
      const [meRes, teamRes, tasksRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users?team=true"),
        fetch("/api/tasks"),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (teamRes.ok) {
        const d = await teamRes.json();
        setTeamMembers(d.users || []);
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
        <LoadingSpinner
          fullscreen
          message="Loading Team Roster"
          subtext="Fetching assigned team members, profiles, and delegated workloads"
        />
      </div>
    );
  }

  // Calculate team-wide summary metrics
  const totalSubordinates = teamMembers.length;
  const delegatedTasks = tasks.filter((t) =>
    teamMembers.some((m) => m._id === t.assignedTo?._id)
  );
  const totalActiveTasks = delegatedTasks.filter((t) => t.status !== "completed").length;
  const totalCompletedTasks = delegatedTasks.filter((t) => t.status === "completed").length;
  const completionRate =
    delegatedTasks.length > 0
      ? Math.round((totalCompletedTasks / delegatedTasks.length) * 100)
      : 100;

  // Filter team members based on search and workload
  const filteredMembers = teamMembers.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(search.toLowerCase()) ||
      emp.department?.toLowerCase().includes(search.toLowerCase());

    const memberTasks = tasks.filter((t) => t.assignedTo?._id === emp._id);
    const activeCount = memberTasks.filter((t) => t.status !== "completed").length;

    const matchesWorkload =
      workloadFilter === "all" ||
      (workloadFilter === "active" && activeCount > 0) ||
      (workloadFilter === "available" && activeCount === 0);

    return matchesSearch && matchesWorkload;
  });

  const handleOpenProfile = (user: IUser) => {
    setSelectedProfileUser(user);
    setIsProfileDrawerOpen(true);
  };

  return (
    <PortalShell
      user={currentUser}
      title="My Team Roster"
      subtitle={`Direct reporting subordinates assigned under your management by Executive Admin`}
    >
      <div className="space-y-6">
        {/* KPI Summary Header Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Reporting Team
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {totalSubordinates}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Active team members</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tasks In Progress
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {totalActiveTasks}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Active sprint items</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Completed Goals
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {totalCompletedTasks}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Finished deliverables</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Team Velocity
              </p>
              <h3 className="text-2xl font-black text-violet-600 mt-1">
                {completionRate}%
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Overall task throughput</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team by name, designation, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 sm:w-72 text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Workload Filter */}
            <select
              value={workloadFilter}
              onChange={(e) => setWorkloadFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Members ({teamMembers.length})</option>
              <option value="active">Active Workload Only</option>
              <option value="available">Available (0 Active Tasks)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* 2 View Options: Table vs Cards */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
              <button
                onClick={() => handleSetViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "cards"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">Cards</span>
              </button>

              <button
                onClick={() => handleSetViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline text-[11px]">Table</span>
              </button>
            </div>

            {/* Delegate Task Button */}
            <button
              onClick={() => {
                setSelectedMemberForTask(null);
                setIsCreateTaskOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Delegate Task</span>
            </button>
          </div>
        </div>

        {/* Content View: Table vs Cards */}
        {filteredMembers.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">
              {teamMembers.length === 0
                ? "No employees assigned to your team yet"
                : "No matching team members found"}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {teamMembers.length === 0
                ? "Executive Admin has not yet assigned subordinate employees to your leadership. Contact executive admin to assign team members."
                : "Try clearing your search query or switching your workload filter."}
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Team Member</th>
                    <th className="py-4 px-6">Designation & Department</th>
                    <th className="py-4 px-6">Workload & Sprint Progress</th>
                    <th className="py-4 px-6">Contact Channels</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMembers.map((emp) => {
                    const memberTasks = tasks.filter((t) => t.assignedTo?._id === emp._id);
                    const activeCount = memberTasks.filter((t) => t.status !== "completed").length;
                    const completedCount = memberTasks.filter((t) => t.status === "completed").length;
                    const empAvatar = getUserAvatar(emp);
                    const memberCompletion =
                      memberTasks.length > 0
                        ? Math.round((completedCount / memberTasks.length) * 100)
                        : 0;

                    return (
                      <tr
                        key={emp._id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Member Profile info */}
                        <td className="py-4 px-6">
                          <div
                            onClick={() => handleOpenProfile(emp)}
                            className="flex items-center gap-3.5 cursor-pointer"
                          >
                            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-indigo-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                              <Image
                                src={empAvatar}
                                alt={emp.name}
                                width={44}
                                height={44}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                  {emp.name}
                                </span>
                                <RoleBadge role={emp.role} />
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                {emp.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Designation & Department */}
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800 truncate">
                            {emp.designation || "Enterprise Contributor"}
                          </p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mt-1">
                            <Building className="w-3 h-3 text-indigo-500" />
                            {emp.department || "Operations"}
                          </span>
                        </td>

                        {/* Workload Metrics & Progress */}
                        <td className="py-4 px-6">
                          <div className="space-y-1.5 max-w-[200px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-indigo-600">
                                {activeCount} Active
                              </span>
                              <span className="text-slate-400 font-medium">
                                {completedCount} Done
                              </span>
                            </div>

                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${memberCompletion}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Contact channels */}
                        <td className="py-4 px-6 text-slate-600">
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{emp.email}</span>
                          </p>
                          {emp.phone && (
                            <p className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{emp.phone}</span>
                            </p>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedMemberForTask(emp);
                                setIsCreateTaskOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200/80 transition-colors flex items-center gap-1 shadow-2xs"
                              title="Delegate new task to this member"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Assign</span>
                            </button>

                            <button
                              onClick={() => handleOpenProfile(emp)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                              title="Inspect Full Profile and Activity Logs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing {filteredMembers.length} team members</span>
              <span className="font-mono text-[11px]">Direct Hierarchy Desk</span>
            </div>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((emp) => {
              const memberTasks = tasks.filter((t) => t.assignedTo?._id === emp._id);
              const activeCount = memberTasks.filter((t) => t.status !== "completed").length;
              const completedCount = memberTasks.filter((t) => t.status === "completed").length;
              const empAvatar = getUserAvatar(emp);
              const memberCompletion =
                memberTasks.length > 0
                  ? Math.round((completedCount / memberTasks.length) * 100)
                  : 0;

              return (
                <div
                  key={emp._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top subtle accent */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-60" />

                  <div>
                    {/* Member Profile Block */}
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        onClick={() => handleOpenProfile(emp)}
                        className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-indigo-500/20 shadow-sm shrink-0 cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      >
                        <Image
                          src={empAvatar}
                          alt={emp.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            onClick={() => handleOpenProfile(emp)}
                            className="text-sm font-black text-slate-900 truncate hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            {emp.name}
                          </h4>
                          <RoleBadge role={emp.role} />
                        </div>

                        <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                          {emp.designation || "Team Contributor"}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-full inline-block">
                            {emp.department || "Operations"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 py-3.5 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/60 rounded-2xl px-3.5 mb-4">
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </p>
                      {emp.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{emp.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {/* Workload Progress & Stats */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 bg-indigo-50/60 border border-indigo-100/80 rounded-2xl">
                          <p className="text-[10px] text-indigo-700 font-extrabold uppercase">
                            Active Tasks
                          </p>
                          <p className="text-lg font-black text-indigo-600 mt-0.5">
                            {activeCount}
                          </p>
                        </div>
                        <div className="p-2.5 bg-emerald-50/60 border border-emerald-100/80 rounded-2xl">
                          <p className="text-[10px] text-emerald-700 font-extrabold uppercase">
                            Completed
                          </p>
                          <p className="text-lg font-black text-emerald-600 mt-0.5">
                            {completedCount}
                          </p>
                        </div>
                      </div>

                      {/* Progress Line */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                          <span>Sprint Progress</span>
                          <span>{memberCompletion}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${memberCompletion}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenProfile(emp)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile & Logs</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMemberForTask(emp);
                          setIsCreateTaskOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Task</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false);
          setSelectedMemberForTask(null);
        }}
        currentUser={currentUser}
        onTaskCreated={() => fetchData()}
      />

      {/* User Profile Full Drawer */}
      <UserProfileDrawer
        user={selectedProfileUser}
        isOpen={isProfileDrawerOpen}
        onClose={() => {
          setIsProfileDrawerOpen(false);
          setSelectedProfileUser(null);
        }}
      />
    </PortalShell>
  );
}
