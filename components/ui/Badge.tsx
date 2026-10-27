import React from "react";
import { TaskStatus, TaskPriority, UserRole, QueryStatus } from "@/lib/types";
import { Shield, GitBranch, User, Flame, AlertCircle, Clock, CheckCircle2, XCircle, RotateCcw, AlertOctagon } from "lucide-react";

export function RoleBadge({ role }: { role: UserRole }) {
  const configs: Record<
    UserRole,
    { label: string; bg: string; text: string; border: string; dot: string; icon: React.ReactNode }
  > = {
    admin: {
      label: "Admin",
      bg: "bg-indigo-50 text-indigo-700",
      text: "text-indigo-700",
      border: "border-indigo-200/90",
      dot: "bg-indigo-500",
      icon: <Shield className="w-3 h-3 text-indigo-600 stroke-[2.2]" />,
    },
    manager: {
      label: "Manager",
      bg: "bg-sky-50 text-sky-700",
      text: "text-sky-700",
      border: "border-sky-200/90",
      dot: "bg-sky-500",
      icon: <GitBranch className="w-3 h-3 text-sky-600 stroke-[2.2]" />,
    },
    employee: {
      label: "Employee",
      bg: "bg-slate-50 text-slate-700",
      text: "text-slate-700",
      border: "border-slate-200/90",
      dot: "bg-slate-500",
      icon: <User className="w-3 h-3 text-slate-600 stroke-[2.2]" />,
    },
  };

  const c = configs[role] || configs.employee;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase border ${c.bg} ${c.border}`}
    >
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus | QueryStatus | string }) {
  const configs: Record<
    string,
    { label: string; bg: string; text?: string; border: string; dot: string }
  > = {
    assigned: {
      label: "Assigned",
      bg: "bg-blue-50/80 text-blue-700",
      border: "border-blue-200/80",
      dot: "bg-blue-500",
    },
    pending: {
      label: "Pending",
      bg: "bg-amber-50/80 text-amber-700",
      border: "border-amber-200/80",
      dot: "bg-amber-500",
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-sky-50/80 text-sky-800",
      border: "border-sky-200/80",
      dot: "bg-sky-500",
    },
    on_hold: {
      label: "On Hold",
      bg: "bg-purple-50/80 text-purple-700",
      border: "border-purple-200/80",
      dot: "bg-purple-500",
    },
    in_review: {
      label: "In Review",
      bg: "bg-indigo-50/80 text-indigo-700",
      border: "border-indigo-200/80",
      dot: "bg-indigo-500",
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50/80 text-emerald-800",
      border: "border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-slate-100 text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    blocked: {
      label: "Blocked",
      bg: "bg-rose-50/80 text-rose-700",
      border: "border-rose-200/80",
      dot: "bg-rose-500",
    },
    open: {
      label: "Open Query",
      bg: "bg-emerald-50/80 text-emerald-700",
      border: "border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    resolved: {
      label: "Resolved",
      bg: "bg-teal-50/80 text-teal-800",
      border: "border-teal-200/80",
      dot: "bg-teal-500",
    },
    reopened: {
      label: "Reopened",
      bg: "bg-amber-50/80 text-amber-800",
      border: "border-amber-200/80",
      dot: "bg-amber-500",
    },
    closed: {
      label: "Closed",
      bg: "bg-slate-100 text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
  };

  const c =
    configs[status] || {
      label: status,
      bg: "bg-slate-100 text-slate-800",
      border: "border-slate-200",
      dot: "bg-slate-400",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${c.bg} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span>{c.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority | "normal" | "urgent" | string }) {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    urgent: {
      label: "Urgent",
      bg: "bg-rose-50 text-rose-700",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: <Flame className="w-3 h-3 text-rose-600 stroke-[2]" />,
    },
    high: {
      label: "High",
      bg: "bg-amber-50 text-amber-800",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: <AlertCircle className="w-3 h-3 text-amber-600 stroke-[2]" />,
    },
    medium: {
      label: "Medium",
      bg: "bg-sky-50 text-sky-800",
      text: "text-sky-800",
      border: "border-sky-200",
      icon: <Clock className="w-3 h-3 text-sky-600" />,
    },
    normal: {
      label: "Normal",
      bg: "bg-blue-50 text-blue-800",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: <Clock className="w-3 h-3 text-blue-600" />,
    },
    low: {
      label: "Low",
      bg: "bg-slate-50 text-slate-700",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />,
    },
  };

  const c = configs[priority] || configs.medium;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.icon}
      <span>{c.label}</span>
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
      className={`inline-flex items-center font-bold rounded-xl border ${
        variants[variant] || variants.neutral
      } ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
