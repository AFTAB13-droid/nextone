"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import TodayTargetEditor from "@/components/targets/TodayTargetEditor";
import TargetCard from "@/components/targets/TargetCard";
import { Target as TargetIcon, History, Calendar, CheckCircle2 } from "lucide-react";
import { AuthSession, ITarget } from "@/lib/types";

export default function EmployeeTargetsPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [todayTarget, setTodayTarget] = useState<ITarget | null>(null);
  const [history, setHistory] = useState<ITarget[]>([]);
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

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner fullscreen message="Loading Today's Target" subtext="Fetching daily milestone objectives and commitment logs" />
      </div>
    );
  }

  // Filter out today's target from history list so it doesn't show twice
  const todayStr = new Date().toISOString().split("T")[0];
  const pastTargets = history.filter((t) => t.date !== todayStr);

  return (
    <PortalShell
      user={currentUser}
      title="Daily Targets & Commitments"
      subtitle="Define what you will deliver today, log progress updates, and receive managerial feedback and coaching"
    >
      <div className="space-y-8 max-w-5xl">
        {/* Today's Target Editor */}
        <section>
          <TodayTargetEditor
            onTargetSaved={(target) => {
              setTodayTarget(target);
              fetchData();
            }}
          />
        </section>

        {/* If Today's Target has feedback comments from Manager or Admin */}
        {todayTarget && todayTarget.comments && todayTarget.comments.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TargetIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Today&apos;s Target & Manager Feedback Discussion
              </h3>
            </div>
            <TargetCard
              target={todayTarget}
              currentUserRole={currentUser.role}
              currentUserId={currentUser.userId}
              onCommentAdded={(updated) => setTodayTarget(updated)}
            />
          </section>
        )}

        {/* History / Previous Commitments */}
        <section className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Past Targets & History</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {pastTargets.length} past {pastTargets.length === 1 ? "entry" : "entries"} recorded
            </span>
          </div>

          {pastTargets.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-600">No past target history recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
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
