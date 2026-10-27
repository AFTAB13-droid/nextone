"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TodayTargetEditor from "@/components/targets/TodayTargetEditor";
import TargetCard from "@/components/targets/TargetCard";
import StatCard from "@/components/ui/StatCard";
import {
  Target as TargetIcon,
  History,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Search,
} from "lucide-react";
import { AuthSession, ITarget } from "@/lib/types";

export default function EmployeeTargetsPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [todayTarget, setTodayTarget] = useState<ITarget | null>(null);
  const [history, setHistory] = useState<ITarget[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [historySearch, setHistorySearch] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meRes, todayRes, historyRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/targets"),
        fetch("/api/targets/history"),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (todayRes.ok) {
        const d = await todayRes.json();
        setTodayTarget(d.target || null);
      }
      if (historyRes.ok) {
        const d = await historyRes.json();
        setHistory(d.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter out today's target from past history list so it doesn't show twice
  const todayStr = new Date().toISOString().split("T")[0];
  const pastTargets = useMemo(() => {
    return history
      .filter((t) => t.date !== todayStr)
      .filter((t) => {
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        const matchesSearch =
          t.targetText.toLowerCase().includes(historySearch.toLowerCase()) ||
          (t.progressNotes && t.progressNotes.toLowerCase().includes(historySearch.toLowerCase())) ||
          t.date.includes(historySearch);
        return matchesStatus && matchesSearch;
      });
  }, [history, todayStr, statusFilter, historySearch]);

  // KPI Calculations (including today if available)
  const allRecords = useMemo(() => {
    if (!todayTarget) return history;
    const exists = history.some((h) => h.date === todayTarget.date);
    return exists ? history : [todayTarget, ...history];
  }, [history, todayTarget]);

  const totalLogged = allRecords.length;
  const totalAchieved = allRecords.filter((t) => t.status === "achieved").length;
  const achievementRate = totalLogged ? Math.round((totalAchieved / totalLogged) * 100) : 0;

  const todayStatusLabel = todayTarget
    ? todayTarget.status === "achieved"
      ? "Achieved"
      : todayTarget.status === "in_progress"
      ? "In Progress"
      : todayTarget.status === "partially_achieved"
      ? "Partially"
      : "Committed"
    : "Not Set";

  const todayStatusTheme = todayTarget
    ? todayTarget.status === "achieved"
      ? "emerald"
      : todayTarget.status === "in_progress"
      ? "amber"
      : "indigo"
    : "rose";

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner
          fullscreen
          message="Loading Daily Targets"
          subtext="Fetching milestone objectives and commitment logs"
        />
      </div>
    );
  }

  return (
    <PortalShell
      user={currentUser}
      title="Daily Targets & Commitments"
      subtitle="Define what you will deliver today, log progress updates, and collaborate with your manager"
    >
      <div className="space-y-8 max-w-6xl">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Target"
            value={todayStatusLabel}
            subtitle={
              todayTarget
                ? todayTarget.status === "achieved"
                  ? "Milestone verified"
                  : "Active daily goal"
                : "Commitment needed"
            }
            icon={TargetIcon}
            color={todayStatusTheme as any}
            badge={!todayTarget ? "Action Required" : todayTarget.status === "achieved" ? "Completed" : "Active"}
          />
          <StatCard
            title="Total Targets"
            value={totalLogged}
            subtitle="Logged commitments"
            icon={Calendar}
            color="indigo"
          />
          <StatCard
            title="Goals Achieved"
            value={totalAchieved}
            subtitle="Verified deliverables"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Achievement Velocity"
            value={`${achievementRate}%`}
            subtitle="Fulfillment rate"
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Today's Target Editor & Active Viewer */}
        <section>
          <TodayTargetEditor
            todayTarget={todayTarget}
            currentUserRole={currentUser.role}
            currentUserId={currentUser.userId}
            onTargetSaved={(target) => {
              setTodayTarget(target);
              fetchData();
            }}
            onCommentAdded={(updated) => {
              setTodayTarget(updated);
            }}
          />
        </section>

        {/* History / Previous Commitments */}
        <section className="pt-6 border-t border-slate-200/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-extrabold text-slate-900">Past Targets & History</h3>
              <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                {pastTargets.length} entries
              </span>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search past targets or date (YYYY-MM)..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-56 sm:w-64 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="achieved">Achieved</option>
                <option value="in_progress">In Progress</option>
                <option value="partially_achieved">Partially Achieved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {pastTargets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="font-bold text-slate-700 text-sm">No past targets match this filter</p>
              <p className="text-xs text-slate-400 mt-1">
                Your past daily goals and manager feedback will be chronologically archived here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pastTargets.map((item) => (
                <TargetCard
                  key={item._id}
                  target={item}
                  currentUserRole={currentUser.role}
                  currentUserId={currentUser.userId}
                  onCommentAdded={(updated) => {
                    setHistory((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
