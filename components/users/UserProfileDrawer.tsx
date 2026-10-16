"use client";

import React, { useState, useEffect } from "react";
import { IUser, ITask, IQuery } from "@/lib/types";
import { getUserAvatar } from "@/lib/avatarHelper";
import { RoleBadge } from "@/components/ui/Badge";
import {
  X,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  HelpCircle,
  Activity,
  Layers,
  ArrowUpRight,
  Power,
  Edit2,
  UserPlus,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import UserTelemetryTab from "@/components/telemetry/UserTelemetryTab";

interface UserProfileDrawerProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser?: (user: IUser) => void;
  onToggleStatus?: (user: IUser) => void;
  onAssignTeam?: (manager: IUser) => void;
}

export function UserProfileDrawer({
  user,
  isOpen,
  onClose,
  onEditUser,
  onToggleStatus,
  onAssignTeam,
}: UserProfileDrawerProps) {
  const [detailedUser, setDetailedUser] = useState<IUser | null>(user);
  const [resolvedManager, setResolvedManager] = useState<IUser | null>(null);
  const [userTasks, setUserTasks] = useState<ITask[]>([]);
  const [userQueries, setUserQueries] = useState<IQuery[]>([]);
  const [subordinates, setSubordinates] = useState<IUser[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [activeTab, setActiveTab] = useState<"telemetry" | "overview">("telemetry");

  // Sync initial state when drawer opens or user prop changes
  useEffect(() => {
    if (!isOpen || !user) {
      setDetailedUser(null);
      setResolvedManager(null);
      return;
    }

    setDetailedUser(user);

    // If managerId is already an object with a name, immediately use it
    if (typeof user.managerId === "object" && user.managerId && (user.managerId as any).name) {
      setResolvedManager(user.managerId as IUser);
    } else {
      setResolvedManager(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchUserDetails = async () => {
      setLoadingMetrics(true);
      setLoadingHierarchy(true);

      try {
        // 1. Fetch complete, fresh user record to ensure populated hierarchy
        const userFetchPromise = fetch(`/api/users/${user._id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then(async (data) => {
            if (data?.user) {
              setDetailedUser(data.user);
              const mId = data.user.managerId;
              if (typeof mId === "object" && mId && mId.name) {
                setResolvedManager(mId as IUser);
              } else if (typeof mId === "string" && mId) {
                // If it came back as a raw ID string, fetch the manager directly
                try {
                  const mgrRes = await fetch(`/api/users/${mId}`);
                  if (mgrRes.ok) {
                    const mgrData = await mgrRes.json();
                    if (mgrData.user) setResolvedManager(mgrData.user);
                  }
                } catch {
                  // ignore
                }
              } else {
                setResolvedManager(null);
              }
            }
          })
          .catch((err) => console.error("Error fetching user details:", err))
          .finally(() => setLoadingHierarchy(false));

        // 2. Fetch user tasks
        const tasksPromise = fetch("/api/tasks")
          .then((res) => (res.ok ? res.json() : null))
          .then((d) => {
            const allTasks: ITask[] = d?.tasks || [];
            setUserTasks(
              allTasks.filter((t) => {
                const aid =
                  typeof t.assignedTo === "object" && t.assignedTo
                    ? t.assignedTo._id
                    : t.assignedTo;
                return aid === user._id;
              })
            );
          })
          .catch((e) => console.error(e));

        // 3. Fetch user queries
        const queriesPromise = fetch("/api/queries")
          .then((res) => (res.ok ? res.json() : null))
          .then((qd) => {
            const allQueries: IQuery[] = qd?.queries || [];
            setUserQueries(
              allQueries.filter((q) => {
                const rid =
                  typeof q.raisedBy === "object" && q.raisedBy
                    ? q.raisedBy._id
                    : q.raisedBy;
                return rid === user._id;
              })
            );
          })
          .catch((e) => console.error(e));

        // 4. If manager, fetch their supervised team
        const subordinatesPromise =
          user.role === "manager"
            ? fetch(`/api/users?managerId=${user._id}`)
                .then((res) => (res.ok ? res.json() : null))
                .then((ud) => {
                  setSubordinates(ud?.users || []);
                })
                .catch((e) => console.error(e))
            : Promise.resolve();

        await Promise.all([userFetchPromise, tasksPromise, queriesPromise, subordinatesPromise]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchUserDetails();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const currentUserData = detailedUser || user;
  const managerObj =
    resolvedManager ||
    (typeof currentUserData.managerId === "object" &&
    currentUserData.managerId &&
    (currentUserData.managerId as any).name
      ? (currentUserData.managerId as IUser)
      : null);

  const isUserActive = currentUserData.isActive !== false;
  const completedTasks = userTasks.filter((t) => t.status === "completed").length;
  const pendingTasks = userTasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Full-Screen Drawer Console */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-200/90 overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shimmer line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 bg-[length:200%_auto] animate-[shimmer_3s_infinite_linear]" />

        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NextOne Enterprise • Comprehensive User Profile</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all btn-action"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Identity Details */}
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-slate-800 ring-4 ring-indigo-500/30 shadow-2xl shrink-0">
                <Image
                  src={getUserAvatar(currentUserData)}
                  alt={currentUserData.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {currentUserData.name}
                  </h2>
                  <RoleBadge role={currentUserData.role} />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-indigo-300">
                  {currentUserData.designation} • {currentUserData.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    {currentUserData.email}
                  </span>
                  {currentUserData.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {currentUserData.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              {onEditUser && (
                <button
                  onClick={() => {
                    onClose();
                    onEditUser(currentUserData);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 btn-action"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}

              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(currentUserData)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 btn-action ${
                    isUserActive
                      ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isUserActive ? "Deactivate" : "Activate"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "telemetry"
                  ? "bg-white text-slate-900 shadow-lg shadow-black/20"
                  : "bg-white/10 hover:bg-white/15 text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Workforce Intelligence & Hours</span>
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "overview"
                  ? "bg-white text-slate-900 shadow-lg shadow-black/20"
                  : "bg-white/10 hover:bg-white/15 text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Organization & Hierarchy</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[calc(85vh-200px)] overflow-y-auto space-y-6">
          {activeTab === "telemetry" ? (
            <UserTelemetryTab user={currentUserData} />
          ) : (
            <>
              {/* Telemetry Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                Total Assigned
              </span>
              <p className="text-xl sm:text-2xl font-black text-indigo-950 mt-1">
                {userTasks.length}
              </p>
              <span className="text-[11px] text-indigo-500 font-medium">Lifecycle Tasks</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                Completed
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
                {completedTasks}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Verified Done</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                Pending / Active
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                {pendingTasks}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">In Flight</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                Queries Logged
              </span>
              <p className="text-xl sm:text-2xl font-black text-purple-950 mt-1">
                {userQueries.length}
              </p>
              <span className="text-[11px] text-purple-600 font-medium">Help Desk Threads</span>
            </div>
          </div>

          {/* Reporting Line Section */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Reporting Line & Organizational Hierarchy</span>
            </h4>

            {currentUserData.role === "employee" ? (
              managerObj ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 ring-2 ring-indigo-500/20 shrink-0">
                      <Image
                        src={getUserAvatar(managerObj)}
                        alt={managerObj.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-900">{managerObj.name}</p>
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                          Assigned Operations Manager
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {managerObj.designation || "Lead"} • {managerObj.department || "Operations"}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                        <span>{managerObj.email}</span>
                        {managerObj.phone && <span>• {managerObj.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <RoleBadge role="manager" />
                </div>
              ) : loadingHierarchy ? (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>Loading supervisor hierarchy details...</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Currently unassigned to any manager. Reports directly to Executive Admin.</span>
                </div>
              )
            ) : currentUserData.role === "manager" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-700 font-bold">
                    Supervised Direct Reports ({subordinates.length} Employees):
                  </p>
                  {onAssignTeam && (
                    <button
                      type="button"
                      onClick={() => onAssignTeam(currentUserData)}
                      className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <UserPlus className="w-3 h-3 text-indigo-600" />
                      <span>Assign Employees</span>
                    </button>
                  )}
                </div>
                {subordinates.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No employees assigned under this manager yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subordinates.map((sub) => (
                      <div
                        key={sub._id}
                        className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          <Image
                            src={getUserAvatar(sub)}
                            alt={sub.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{sub.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{sub.designation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-indigo-50 text-xs font-bold text-indigo-900">
                Executive Command: Full governing authority over all company operations.
              </div>
            )}
          </div>

          {/* User Activity & Assignment History */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>User Activity & Assignment Audit Trail</span>
            </h4>

            {userTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active task engagements recorded.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {userTasks.slice(0, 6).map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Due: {new Date(t.dueDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>

    {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span>User ID: #{currentUserData._id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Profile Console
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileDrawer;
