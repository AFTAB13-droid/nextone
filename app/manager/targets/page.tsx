"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TargetCard from "@/components/targets/TargetCard";
import SetEmployeeTargetModal from "@/components/targets/SetEmployeeTargetModal";
import StatCard from "@/components/ui/StatCard";
import {
  Target as TargetIcon,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
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
  const [isSetTargetOpen, setIsSetTargetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [meRes, teamRes, targetsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users?team=true"),
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
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner
          fullscreen
          message="Loading Team Daily Targets"
          subtext="Aggregating performance quotas and team completion milestones"
        />
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
      subtitle="Review today's commitments from your direct reports, give feedback, or prescribe operational target goals"
    >
      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Daily Targets Recorded"
          value={targets.length}
          subtitle={`Commitments for ${selectedDate}`}
          icon={TargetIcon}
          color="indigo"
        />
        <StatCard
          title="Marked Achieved"
          value={achievedCount}
          subtitle="Verified successful goals"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Work items underway today"
          icon={Clock}
          color="amber"
        />
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

        {/* Action Button: Set Target */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-500 hidden sm:block">
            {refreshing ? "Refreshing..." : `${targets.length} employee commitments`}
          </div>

          <button
            onClick={() => setIsSetTargetOpen(true)}
            className="px-4 py-2 text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 btn-action"
          >
            <Plus className="w-4 h-4" />
            <span>Set Employee Target</span>
          </button>
        </div>
      </div>

      {/* Target Cards Grid */}
      {targets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <TargetIcon className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            No commitments recorded for {selectedDate}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Team members submit their targets at the start of their workday. You can also proactively prescribe a target goal or sprint milestone for any direct report right now.
          </p>
          <button
            onClick={() => setIsSetTargetOpen(true)}
            className="px-5 py-2.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Set Target for Direct Report</span>
          </button>
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

      {/* Set Target Modal */}
      <SetEmployeeTargetModal
        isOpen={isSetTargetOpen}
        onClose={() => setIsSetTargetOpen(false)}
        team={team}
        preselectedEmployeeId={selectedEmployeeId !== "all" ? selectedEmployeeId : undefined}
        onTargetSet={() => fetchData()}
      />
    </PortalShell>
  );
}
