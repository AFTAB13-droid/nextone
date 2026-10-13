import React from "react";
import { TaskStatus, TaskPriority, UserRole, QueryStatus } from "@/lib/types";

export function RoleBadge({ role }: { role: UserRole }) {
  const configs: Record<UserRole, { label: string; bg: string; text: string; dot: string }> = {
    admin: { label: "Executive Admin", bg: "bg-purple-100 border-purple-200", text: "text-purple-800", dot: "bg-purple-600" },
    manager: { label: "Manager", bg: "bg-blue-100 border-blue-200", text: "text-blue-800", dot: "bg-blue-600" },
    employee: { label: "Employee", bg: "bg-emerald-100 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-600" },
  };

  const c = configs[role] || configs.employee;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus | QueryStatus }) {
  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    pending: { label: "Pending", bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
    in_progress: { label: "In Progress", bg: "bg-sky-50 border-sky-200", text: "text-sky-800", dot: "bg-sky-500" },
    in_review: { label: "In Review", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-800", dot: "bg-indigo-500" },
    completed: { label: "Completed", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
    blocked: { label: "Blocked", bg: "bg-rose-50 border-rose-200", text: "text-rose-800", dot: "bg-rose-500" },
    open: { label: "Open", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
    resolved: { label: "Resolved", bg: "bg-teal-50 border-teal-200", text: "text-teal-800", dot: "bg-teal-500" },
    closed: { label: "Closed", bg: "bg-slate-100 border-slate-200", text: "text-slate-700", dot: "bg-slate-400" },
  };

  const c = configs[status] || { label: status, bg: "bg-slate-100 border-slate-200", text: "text-slate-800", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority | "normal" | "urgent" }) {
  const configs: Record<string, { label: string; bg: string; text?: string }> = {
    urgent: { label: "Urgent", bg: "bg-rose-100 text-rose-800 border-rose-200" },
    high: { label: "High", bg: "bg-orange-100 text-orange-800 border-orange-200" },
    medium: { label: "Medium", bg: "bg-blue-100 text-blue-800 border-blue-200" },
    normal: { label: "Normal", bg: "bg-blue-100 text-blue-800 border-blue-200" },
    low: { label: "Low", bg: "bg-slate-100 text-slate-700 border-slate-200" },
  };

  const c = configs[priority] || configs.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${c.bg}`}>
      {c.label}
    </span>
  );
}
