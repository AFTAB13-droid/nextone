"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { IUser } from "@/lib/types";
import { getUserAvatar } from "@/lib/avatarHelper";
import { Target as TargetIcon, Send, AlertTriangle, UserCheck, Sparkles, Clock } from "lucide-react";
import Image from "next/image";

interface SetEmployeeTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: IUser[];
  preselectedEmployeeId?: string;
  onTargetSet: () => void;
}

export function SetEmployeeTargetModal({
  isOpen,
  onClose,
  team,
  preselectedEmployeeId,
  onTargetSet,
}: SetEmployeeTargetModalProps) {
  const [employeeId, setEmployeeId] = useState<string>("");
  const [targetText, setTargetText] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [status, setStatus] = useState<"in_progress" | "pending">("in_progress");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (preselectedEmployeeId) {
      setEmployeeId(preselectedEmployeeId);
    } else if (team.length > 0 && !employeeId) {
      setEmployeeId(team[0]._id);
    }
    setError(null);
  }, [isOpen, preselectedEmployeeId, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError("Please select a direct report");
      return;
    }
    if (!targetText.trim()) {
      setError("Please enter the daily commitment or objective");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          targetText: targetText.trim(),
          progressNotes: progressNotes.trim(),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to set daily target");
      }

      setTargetText("");
      setProgressNotes("");
      onTargetSet();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error setting target";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = team.find((e) => e._id === employeeId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Direct Report Daily Target"
      description="Prescribe a daily goal or operational milestone directly for an assigned employee"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Employee Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Assign To Team Member <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 border border-slate-200/80 rounded-2xl bg-slate-50/50">
            {team.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 col-span-2">
                No direct reports assigned to your management.
              </p>
            ) : (
              team.map((emp) => {
                const isSelected = emp._id === employeeId;
                return (
                  <div
                    key={emp._id}
                    onClick={() => setEmployeeId(emp._id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                      <Image
                        src={getUserAvatar(emp)}
                        alt={emp.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{emp.designation || "Associate"}</p>
                    </div>
                    {isSelected && (
                      <UserCheck className="w-4 h-4 text-indigo-600 ml-auto shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Target Objective */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <TargetIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Today&apos;s Target Objective <span className="text-rose-500">*</span></span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="e.g. Complete mobile layout audit for analytics dashboard, implement Redis cache layer for report query, and review PR #89"
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all leading-relaxed"
          />
        </div>

        {/* Manager Guidance & Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Manager Guidance or Directive Context (Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Focus on edge-case testing first; let me know if Razorpay sandbox API limits block progress."
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
          />
        </div>

        {/* Status Option */}
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-slate-700">Initial Status:</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatus("in_progress")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status === "in_progress"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStatus("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status === "pending"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || team.length === 0}
            className="px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50 btn-action"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? "Prescribing Target..." : "Assign Target Goal"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default SetEmployeeTargetModal;
