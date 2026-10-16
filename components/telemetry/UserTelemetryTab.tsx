"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IUser, IUserDailyTelemetry, ITelemetrySummary } from "@/lib/types";
import {
  Clock,
  Activity,
  Calendar,
  Download,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Wifi,
  Send,
  Zap,
  Coffee,
  TrendingUp,
  RefreshCw,
  Sliders,
  X,
  Printer,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Laptop,
} from "lucide-react";

interface UserTelemetryTabProps {
  user: IUser;
}

export function UserTelemetryTab({ user }: UserTelemetryTabProps) {
  const [range, setRange] = useState<string>("this_month");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<ITelemetrySummary | null>(null);
  const [logs, setLogs] = useState<IUserDailyTelemetry[]>([]);
  const [selectedDayForTimeline, setSelectedDayForTimeline] = useState<IUserDailyTelemetry | null>(null);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // FCM Push Testing State
  const [userData, setUserData] = useState<any>(user);
  const [testingPush, setTestingPush] = useState(false);
  const [pushResult, setPushResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/telemetry/user/${user._id}?range=${range}`;
      if (range === "custom" && customStart && customEnd) {
        url += `&startDate=${customStart}&endDate=${customEnd}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setLogs(data.logs || []);
        if (data.user) setUserData(data.user);
        if (data.logs && data.logs.length > 0) {
          setSelectedDayForTimeline(data.logs[0]);
        } else {
          setSelectedDayForTimeline(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch telemetry:", err);
    } finally {
      setLoading(false);
    }
  }, [user._id, range, customStart, customEnd]);

  const handleTestPush = async () => {
    setTestingPush(true);
    setPushResult(null);
    try {
      const res = await fetch("/api/notifications/test-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user._id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPushResult({ type: "success", text: data.message });
      } else {
        setPushResult({ type: "error", text: data.error || "Failed to dispatch test push" });
      }
    } catch {
      setPushResult({ type: "error", text: "Network error sending test push" });
    } finally {
      setTestingPush(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();

    // Auto-sync live presence and telemetry every 8 seconds
    const interval = setInterval(() => {
      let url = `/api/telemetry/user/${user._id}?range=${range}`;
      if (range === "custom" && customStart && customEnd) {
        url += `&startDate=${customStart}&endDate=${customEnd}`;
      }
      fetch(url)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setSummary(data.summary);
            setLogs(data.logs || []);
          }
        })
        .catch(() => {});
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchTelemetry, user._id, range, customStart, customEnd]);

  // Helpers
  const formatSeconds = (sec: number = 0): string => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h === 0 && m === 0) return "0m";
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const formatClockTime = (d?: string | Date): string => {
    if (!d) return "--:--";
    const dateObj = new Date(d);
    return dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;

    const headers = [
      "Date",
      "First Seen (Punch In)",
      "Last Seen (Punch Out)",
      "Active Work Seconds",
      "Active Work Hours",
      "Idle Seconds",
      "Idle Hours",
      "Total Screen Seconds",
      "Day Attendance Status",
      "OS / Device",
      "Browser",
    ];

    const rows = logs.map((l) => [
      l.date,
      formatClockTime(l.firstSeenAt),
      formatClockTime(l.lastSeenAt),
      l.activeSeconds || 0,
      formatSeconds(l.activeSeconds),
      l.idleSeconds || 0,
      formatSeconds(l.idleSeconds),
      l.totalSeconds || 0,
      l.dayStatus,
      l.deviceInfo?.os || "Desktop",
      l.deviceInfo?.browser || "Browser",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NextOne_WorkHours_${user.name.replace(/\s+/g, "_")}_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable View
  const handlePrint = () => {
    window.print();
  };

  // Send Email
  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailStatusMessage(null);
    try {
      const res = await fetch("/api/telemetry/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          range,
          startDate: range === "custom" ? customStart : undefined,
          endDate: range === "custom" ? customEnd : undefined,
          customNote,
          ccEmail: ccEmail || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatusMessage({
          type: "success",
          text: data.delivered
            ? `Report successfully emailed to ${data.recipientEmail}`
            : `Report prepared for ${data.recipientEmail}. (Note: configure SMTP in .env.local to dispatch real emails)`,
        });
        setTimeout(() => {
          setIsEmailModalOpen(false);
          setEmailStatusMessage(null);
          setCustomNote("");
        }, 3000);
      } else {
        setEmailStatusMessage({
          type: "error",
          text: data.error || "Failed to dispatch email report.",
        });
      }
    } catch {
      setEmailStatusMessage({
        type: "error",
        text: "Network error occurred while emailing report.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const live = summary?.currentLiveStatus;

  return (
    <div className="space-y-6">
      {/* 1. Live Presence Radar Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Pulsing Sonar Ring */}
            <div className="relative flex items-center justify-center shrink-0">
              {live?.status === "active" ? (
                <>
                  <span className="absolute w-5 h-5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/30" />
                </>
              ) : live?.status === "idle" ? (
                <>
                  <span className="absolute w-5 h-5 rounded-full bg-amber-400 animate-ping opacity-50" />
                  <span className="relative w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-500/30" />
                </>
              ) : (
                <span className="w-4 h-4 rounded-full bg-slate-500 ring-4 ring-slate-600/30" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm sm:text-base font-black tracking-tight">
                  {live?.status === "active"
                    ? "Currently Active & Working"
                    : live?.status === "idle"
                    ? "Away / Screen Idle"
                    : "Currently Offline"}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ring-1 ${
                    live?.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40"
                      : live?.status === "idle"
                      ? "bg-amber-500/20 text-amber-300 ring-amber-500/40"
                      : "bg-slate-700 text-slate-300 ring-slate-600"
                  }`}
                >
                  {live?.status || "offline"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium flex items-center gap-2">
                {live?.currentPath ? (
                  <span>
                    Viewing: <code className="text-cyan-300 font-mono text-[11px]">{live.currentPath}</code>
                  </span>
                ) : (
                  <span>Zero-Click Ambient Monitoring</span>
                )}
                {live?.lastActiveAt && (
                  <span className="text-slate-400 text-[11px]">
                    • Last pulse: {formatClockTime(live.lastActiveAt)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Device & Client Tag */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-slate-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl">
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>{live?.deviceInfo || "Desktop Portal"}</span>
          </div>
        </div>
      </div>

      {/* FCM Desktop Push Diagnostics & Live Test Console */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black tracking-tight text-white">Firebase Cloud Messaging (FCM) Desktop Status</span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ring-1 ${
                (userData?.fcmTokensCount || 0) > 0
                  ? "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 ring-amber-500/40"
              }`}>
                {(userData?.fcmTokensCount || 0) > 0 ? `${userData.fcmTokensCount} Registered Device` : "No Device Token Yet"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {(userData?.fcmTokensCount || 0) > 0
                ? "Compulsory desktop web push is enabled on this user's machine. Ready to receive persistent alerts."
                : "This user has not allowed desktop notifications yet. They must click 'Allow' on the Bell icon prompt."}
            </p>
          </div>
        </div>

        <button
          onClick={handleTestPush}
          disabled={testingPush}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all shrink-0 disabled:opacity-50 active:scale-95"
        >
          <Zap className={`w-3.5 h-3.5 ${testingPush ? "animate-spin" : ""}`} />
          <span>{testingPush ? "Dispatching..." : "Send Test Push to Device"}</span>
        </button>
      </div>

      {pushResult && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 shadow-sm ${
          pushResult.type === "success"
            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
            : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
        }`}>
          {pushResult.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{pushResult.text}</span>
        </div>
      )}

      {/* 2. Controls & Date Range Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        {/* Preset Range Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "this_week", label: "This Week" },
            { id: "this_month", label: "This Month" },
            { id: "last_month", label: "Last Month" },
            { id: "custom", label: "Custom Dates" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setRange(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                range === pill.id
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: PDF, CSV, Email */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTelemetry}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Export to Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Print / Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Report</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers (if "custom" is selected) */}
      {range === "custom" && (
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span>To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-indigo-500"
            />
          </div>
          <button
            onClick={fetchTelemetry}
            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* 3. High-Class Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Work Hours */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-white to-indigo-500/5 border border-indigo-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
              Active Work Time
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatSeconds(summary?.totalActiveSeconds || 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Mouse & keyboard interaction
          </p>
        </div>

        {/* Daily Average Active */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-white to-cyan-500/5 border border-cyan-200/80 shadow-xs relative overflow-hidden group hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-700">
              Daily Average
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatSeconds(summary?.avgDailyActiveSeconds || 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Across {summary?.totalDaysWorked || 0} active days
          </p>
        </div>

        {/* Idle / Away Time */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border border-amber-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
              Idle / Breaks
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatSeconds(summary?.totalIdleSeconds || 0)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Screen on, no input &gt; 3 mins
          </p>
        </div>

        {/* Productivity Ratio */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 border border-emerald-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
              Productivity Ratio
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {summary?.productivityScore || 0}%
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Active vs. total screen time
          </p>
        </div>
      </div>

      {/* 4. 24-Hour Visual Activity Bar for Selected Day */}
      {selectedDayForTimeline && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                24-Hour Day Chronograph
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Timeline for {selectedDayForTimeline.date}</span>
                <span className="text-xs text-slate-400 font-normal">
                  (Started: {formatClockTime(selectedDayForTimeline.firstSeenAt)} • Ended: {formatClockTime(selectedDayForTimeline.lastSeenAt)})
                </span>
              </h4>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active Work
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Off Hours
              </span>
            </div>
          </div>

          {/* 24 Hourly Slots */}
          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 pt-2">
            {Array.from({ length: 24 }).map((_, hour) => {
              const hourKey = hour.toString();
              const hourSeconds = (selectedDayForTimeline.hourlyBlocks as any)?.[hourKey] || 0;
              const pct = Math.min(Math.round((hourSeconds / 3600) * 100), 100);
              const label = hour === 0 ? "12A" : hour < 12 ? `${hour}A` : hour === 12 ? "12P" : `${hour - 12}P`;

              return (
                <div key={hour} className="flex flex-col items-center gap-1 group relative">
                  <div className="w-full h-12 bg-slate-800/80 rounded-lg overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      style={{ height: `${pct}%` }}
                      className={`w-full rounded-md transition-all ${
                        pct > 70
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                          : pct > 20
                          ? "bg-gradient-to-t from-indigo-600 to-cyan-400"
                          : pct > 0
                          ? "bg-indigo-500/60"
                          : "bg-transparent"
                      }`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">{label}</span>

                  {/* Micro Tooltip */}
                  {pct > 0 && (
                    <div className="absolute bottom-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-[10px] text-white px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-20 border border-slate-700">
                      {label}: {formatSeconds(hourSeconds)} active ({pct}%)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Day-by-Day Itemized Attendance Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Itemized Daily Activity Log
            </h3>
            <p className="text-xs text-slate-500">
              Automated ambient punch-in, punch-out, and active screen times
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
            {logs.length} Days Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4">Punch In (Start)</th>
                <th className="py-3 px-4">Punch Out (End)</th>
                <th className="py-3 px-4">Active Work</th>
                <th className="py-3 px-4">Idle / Break</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    {loading ? "Synchronizing telemetry logs..." : "No activity recorded for this date range."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSelected = selectedDayForTimeline?._id === log._id || selectedDayForTimeline?.date === log.date;

                  return (
                    <tr
                      key={log._id || log.date}
                      onClick={() => setSelectedDayForTimeline(log)}
                      className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/70" : ""
                      }`}
                    >
                      <td className="py-3 px-5 font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{log.date}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatClockTime(log.firstSeenAt)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatClockTime(log.lastSeenAt)}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600">
                        {formatSeconds(log.activeSeconds)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatSeconds(log.idleSeconds)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            log.dayStatus === "full_day"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.dayStatus === "overtime"
                              ? "bg-blue-100 text-blue-800"
                              : log.dayStatus === "half_day"
                              ? "bg-amber-100 text-amber-800"
                              : log.dayStatus === "short_day"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {log.dayStatus.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800">
                          {isSelected ? "Viewing" : "Select"} &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Email Report Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative">
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Email Official Work Report
                </h3>
                <p className="text-xs text-slate-500">
                  Dispatches verified hours and attendance table to employee
                </p>
              </div>
            </div>

            <div className="space-y-4 my-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Report Period
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-bold text-indigo-900">
                  {range.replace("_", " ").toUpperCase()} ({logs.length} Days Itemized)
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional CC (Supervisor or HR)
                </label>
                <input
                  type="email"
                  placeholder="manager@company.com"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Remarks / Feedback Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Great performance this month! Please review your active hours."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-500"
                />
              </div>

              {emailStatusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    emailStatusMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {emailStatusMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{emailStatusMessage.text}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Official Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTelemetryTab;
