"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import TargetCard from "@/components/targets/TargetCard";
import {
  Target as TargetIcon,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { AuthSession, ITarget, IUser } from "@/lib/types";

export default function ManagerTargetsPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [targets, setTargets] = useState<ITarget[]>([]);
  const [team, setTeam] = useState<IUser[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [meRes, teamRes, targetsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users?role=employee"),
        fetch(`/api/targets?date=${selectedDate}${selectedEmployeeId !== "all" ? `&employeeId=${selectedEmployeeId}` : ""}`),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (teamRes.ok) {
        const d = await teamRes.json();
        setTeam(d.users || []);
      }
      if (targetsRes.ok) {
        const d = await targetsRes.json();
        // If employeeId is specified, the endpoint might return { target } instead of { targets }
        if (d.targets) {
          setTargets(d.targets);
        } else if (d.target) {
          setTargets([d.target]);
        } else {
          setTargets([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedEmployeeId]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Count metrics for the selected date
  const achievedCount = targets.filter((t) => t.status === "achieved").length;
  const inProgressCount = targets.filter((t) => t.status === "in_progress").length;

  return (
    <PortalShell
      user={currentUser}
      title="Team Daily Targets & Feedback"
      subtitle="Review today's commitments from your assigned direct reports, review progress updates, and give feedback"
    >
      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{targets.length}</div>
            <div className="text-[11px] font-semibold text-slate-500">Targets Submitted on {selectedDate}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{achievedCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Marked Achieved</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{inProgressCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Currently In Progress</div>
          </div>
        </div>
      </div>

      {/* Filter and Date Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-800 focus:outline-none"
            />
          </div>

          {/* Quick Today Button */}
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
              selectedDate === new Date().toISOString().split("T")[0]
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Today
          </button>

          {/* Employee Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Direct Reports ({team.length})</option>
              {team.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.designation || "Employee"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500">
          {refreshing ? "Refreshing..." : `${targets.length} employee commitments`}
        </div>
      </div>

      {/* Target Cards Grid */}
      {targets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
          <TargetIcon className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">No commitments recorded for {selectedDate}</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Team members will submit their targets at the start of their shift. You can leave feedback or guidance once they post.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {targets.map((target) => (
            <TargetCard
              key={target._id}
              target={target}
              currentUserRole={currentUser.role}
              currentUserId={currentUser.userId}
              showEmployeeHeader={true}
              onCommentAdded={(updated) => {
                setTargets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
              }}
            />
          ))}
        </div>
      )}
    </PortalShell>
  );
}
