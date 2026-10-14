"use client";

import React, { useState, useEffect } from "react";
import { Target as TargetIcon, Save, Sparkles, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ITarget } from "@/lib/types";

interface TodayTargetEditorProps {
  onTargetSaved?: (target: ITarget) => void;
}

export function TodayTargetEditor({ onTargetSaved }: TodayTargetEditorProps) {
  const [targetText, setTargetText] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "in_progress" | "achieved" | "partially_achieved">("in_progress");
  const [existingTarget, setExistingTarget] = useState<ITarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchToday = async () => {
    try {
      const res = await fetch("/api/targets");
      if (res.ok) {
        const data = await res.json();
        if (data.target) {
          setExistingTarget(data.target);
          setTargetText(data.target.targetText || "");
          setProgressNotes(data.target.progressNotes || "");
          setStatus(data.target.status || "in_progress");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetText.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetText, progressNotes, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setExistingTarget(data.target);
        setMessage("Today's commitment recorded successfully!");
        if (onTargetSaved) onTargetSaved(data.target);
        setTimeout(() => setMessage(null), 4000);
      } else {
        alert(data.error || "Failed to save target");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <TargetIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Today&apos;s Target</h3>
            <p className="text-[11px] text-slate-400 font-medium">{todayFormatted}</p>
          </div>
        </div>

        {existingTarget && (
          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            Last updated: {new Date(existingTarget.lastUpdatedTime || existingTarget.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Daily Commitment / Goal <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="What key outcomes, milestones, or deliverables are you committed to delivering today?"
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Ongoing Progress Notes (Update throughout the day)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. 2:00 PM: Finished wireframes, beginning client review..."
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="in_progress">In Progress</option>
              <option value="achieved">Achieved</option>
              <option value="partially_achieved">Partially Achieved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || !targetText.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : existingTarget ? "Update Today's Commitment" : "Save Today's Commitment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TodayTargetEditor;
