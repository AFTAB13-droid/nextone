"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { Users, Mail, Phone, Briefcase, Plus, CheckCircle2 } from "lucide-react";
import { AuthSession, IUser, ITask } from "@/lib/types";
import Image from "next/image";

export default function ManagerTeamPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [teamMembers, setTeamMembers] = useState<IUser[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
        <LoadingSpinner fullscreen message="Loading Team Roster" subtext="Fetching assigned team members, profiles, and delegated workloads" />
      </div>
    );
  }

  return (
    <PortalShell
      user={currentUser}
      title="My Team Roster"
      subtitle="Subordinate employees assigned under your management by Executive Admin"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Reporting Subordinates ({teamMembers.length})
          </h3>
          <p className="text-xs text-slate-500">
            Assigned by Admin to report to {currentUser.name}
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Assign Task to Member
        </button>
      </div>

      {teamMembers.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">No employees assigned yet</h4>
          <p className="text-xs text-slate-500">
            Executive Admin has not yet assigned employees to your team. Contact Admin to configure hierarchy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((emp) => {
            const memberTasks = tasks.filter((t) => t.assignedTo?._id === emp._id);
            const activeCount = memberTasks.filter((t) => t.status !== "completed").length;
            const completedCount = memberTasks.filter((t) => t.status === "completed").length;

            return (
              <div
                key={emp._id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 ring-2 ring-indigo-100 shrink-0">
                      <Image
                        src={
                          emp.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            emp.name
                          )}&background=059669&color=fff`
                        }
                        alt={emp.name}
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{emp.name}</h4>
                      <p className="text-xs font-medium text-slate-500 truncate">{emp.designation}</p>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {emp.department || "Operations"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-t border-slate-100 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </p>
                    {emp.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{emp.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Active Tasks</p>
                      <p className="text-base font-extrabold text-indigo-600">{activeCount}</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Completed</p>
                      <p className="text-base font-extrabold text-emerald-600">{completedCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        currentUser={currentUser}
        onTaskCreated={() => fetchData()}
      />
    </PortalShell>
  );
}
