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
} from "lucide-react";
import Image from "next/image";

interface UserProfileDrawerProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onEditUser?: (user: IUser) => void;
  onToggleStatus?: (user: IUser) => void;
}

export function UserProfileDrawer({
  user,
  isOpen,
  onClose,
  onEditUser,
  onToggleStatus,
}: UserProfileDrawerProps) {
  const [userTasks, setUserTasks] = useState<ITask[]>([]);
  const [userQueries, setUserQueries] = useState<IQuery[]>([]);
  const [subordinates, setSubordinates] = useState<IUser[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchUserDetails = async () => {
      setLoadingMetrics(true);
      try {
        // Fetch user tasks
        const tasksRes = await fetch("/api/tasks");
        if (tasksRes.ok) {
          const d = await tasksRes.json();
          const allTasks: ITask[] = d.tasks || [];
          setUserTasks(
            allTasks.filter((t) => {
              const aid = typeof t.assignedTo === "object" && t.assignedTo ? t.assignedTo._id : t.assignedTo;
              return aid === user._id;
            })
          );
        }

        // Fetch user queries
        const queriesRes = await fetch("/api/queries");
        if (queriesRes.ok) {
          const qd = await queriesRes.json();
          const allQueries: IQuery[] = qd.queries || [];
          setUserQueries(
            allQueries.filter((q) => {
              const rid = typeof q.raisedBy === "object" && q.raisedBy ? q.raisedBy._id : q.raisedBy;
              return rid === user._id;
            })
          );
        }

        // If manager, fetch team members
        if (user.role === "manager") {
          const usersRes = await fetch("/api/users");
          if (usersRes.ok) {
            const ud = await usersRes.json();
            const allUsers: IUser[] = ud.users || [];
            setSubordinates(
              allUsers.filter((u) => {
                const mid = typeof u.managerId === "object" && u.managerId ? u.managerId._id : u.managerId;
                return mid === user._id;
              })
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchUserDetails();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const managerObj =
    typeof user.managerId === "object" && user.managerId ? (user.managerId as IUser) : null;
  const isUserActive = user.isActive !== false;
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
                  src={getUserAvatar(user)}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user.name}
                  </h2>
                  <RoleBadge role={user.role} />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-indigo-300">
                  {user.designation} • {user.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {user.phone}
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
                    onEditUser(user);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 btn-action"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}

              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(user)}
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
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[calc(85vh-200px)] overflow-y-auto space-y-6">
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

            {user.role === "employee" ? (
              managerObj ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 ring-2 ring-indigo-500/20 shrink-0">
                      <Image
                        src={getUserAvatar(managerObj)}
                        alt={managerObj.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{managerObj.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Assigned Manager • {managerObj.department}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role="manager" />
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
                  ⚠️ Currently unassigned to any manager. Reports directly to Executive Admin.
                </div>
              )
            ) : user.role === "manager" ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 font-medium">
                  Supervised Direct Reports ({subordinates.length} Employees):
                </p>
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
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span>User ID: #{user._id}</span>
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
