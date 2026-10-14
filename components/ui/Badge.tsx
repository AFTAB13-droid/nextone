import React from "react";
import { TaskStatus, TaskPriority, UserRole, QueryStatus } from "@/lib/types";

export function RoleBadge({ role }: { role: UserRole }) {
  const configs: Record<UserRole, { label: string; bg: string; text: string; dot: string }> = {
    admin: { label: "Executive Admin", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-800", dot: "bg-indigo-600" },
    manager: { label: "Manager", bg: "bg-blue-50 border-blue-200", text: "text-blue-800", dot: "bg-blue-600" },
    employee: { label: "Employee", bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-800", dot: "bg-cyan-600" },
  };

  const c = configs[role] || configs.employee;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus | QueryStatus | string }) {
  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    assigned: { label: "Assigned", bg: "bg-blue-50 border-blue-200", text: "text-blue-800", dot: "bg-blue-500" },
    pending: { label: "Pending", bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
    in_progress: { label: "In Progress", bg: "bg-sky-50 border-sky-200", text: "text-sky-800", dot: "bg-sky-500" },
    on_hold: { label: "On Hold", bg: "bg-purple-50 border-purple-200", text: "text-purple-800", dot: "bg-purple-500" },
    in_review: { label: "In Review", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-800", dot: "bg-indigo-500" },
    completed: { label: "Completed", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
    cancelled: { label: "Cancelled", bg: "bg-slate-100 border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
    blocked: { label: "Blocked", bg: "bg-rose-50 border-rose-200", text: "text-rose-800", dot: "bg-rose-500" },
    open: { label: "Open", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
    resolved: { label: "Resolved", bg: "bg-teal-50 border-teal-200", text: "text-teal-800", dot: "bg-teal-500" },
    reopened: { label: "Reopened", bg: "bg-amber-50 border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
    closed: { label: "Closed", bg: "bg-slate-100 border-slate-200", text: "text-slate-700", dot: "bg-slate-400" },
  };

  const c = configs[status] || { label: status, bg: "bg-slate-100 border-slate-200", text: "text-slate-800", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority | "normal" | "urgent" | string }) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    urgent: { label: "Urgent", bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
    high: { label: "High", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    medium: { label: "Medium", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    normal: { label: "Normal", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    low: { label: "Low", bg: "bg-slate-100 border-slate-200", text: "text-slate-700" },
  };

  const c = configs[priority] || configs.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "primary" | "success" | "warning" | "danger" | "cyan";
  size?: "sm" | "md";
}) {
  const variants = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };
  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg border ${
        variants[variant] || variants.neutral
      } ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
