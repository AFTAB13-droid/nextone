"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TargetCard from "@/components/targets/TargetCard";
import {
  Target as TargetIcon,
  Calendar,
  Users,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { AuthSession, ITarget, IUser } from "@/lib/types";

export default function AdminTargetsPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [targets, setTargets] = useState<ITarget[]>([]);
  const [managers, setManagers] = useState<IUser[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedManagerId, setSelectedManagerId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [meRes, managersRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users?role=manager"),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (managersRes.ok) {
        const d = await managersRes.json();
        setManagers(d.users || []);
      }

      let url = `/api/targets?date=${selectedDate}`;
      if (selectedManagerId !== "all") {
        url += `&managerId=${selectedManagerId}`;
      }
      const targetsRes = await fetch(url);
      if (targetsRes.ok) {
        const d = await targetsRes.json();
        setTargets(d.targets || []);
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
  }, [selectedDate, selectedManagerId]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner fullscreen message="Loading Daily Targets" subtext="Aggregating performance goals, quota milestones, and completion logs" />
      </div>
    );
  }

  const achievedCount = targets.filter((t) => t.status === "achieved").length;
  const inProgressCount = targets.filter((t) => t.status === "in_progress").length;
  const partiallyCount = targets.filter((t) => t.status === "partially_achieved").length;

  return (
    <PortalShell
      user={currentUser}
      title="Organization Daily Commitments"
      subtitle="Executive oversight of all employee daily targets across all business units and manager teams"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{targets.length}</div>
            <div className="text-[11px] font-semibold text-slate-500">Targets Logged</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{achievedCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Achieved</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{inProgressCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">In Progress</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{partiallyCount}</div>
            <div className="text-[11px] font-semibold text-slate-500">Partially Achieved</div>
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

          {/* Manager Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Manager Teams ({managers.length} managers)</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  Team: {m.name} ({m.department || "General"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500">
          {refreshing ? "Refreshing..." : `Showing ${targets.length} commitments`}
        </div>
      </div>

      {/* Targets Grid */}
      {targets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
          <TargetIcon className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">No employee targets recorded for {selectedDate}</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try choosing a different date or clearing the manager team filter.
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
