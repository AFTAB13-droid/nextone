import React from "react";
import { TaskStatus, TaskPriority, UserRole, QueryStatus } from "@/lib/types";
import { Shield, GitBranch, User, Flame, AlertCircle, Clock, CheckCircle2, XCircle, RotateCcw, AlertOctagon } from "lucide-react";

export function RoleBadge({ role }: { role: UserRole }) {
  const configs: Record<
    UserRole,
    { label: string; bg: string; text: string; border: string; glow: string; icon: React.ReactNode }
  > = {
    admin: {
      label: "Executive Admin",
      bg: "bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900",
      text: "text-indigo-200",
      border: "border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]",
      glow: "bg-indigo-400",
      icon: <Shield className="w-3 h-3 text-cyan-300 stroke-[2.5]" />,
    },
    manager: {
      label: "Operations Manager",
      bg: "bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-950",
      text: "text-cyan-200",
      border: "border-cyan-500/35 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
      glow: "bg-cyan-400",
      icon: <GitBranch className="w-3 h-3 text-cyan-400 stroke-[2.5]" />,
    },
    employee: {
      label: "Associate Specialist",
      bg: "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900",
      text: "text-slate-200",
      border: "border-slate-700 shadow-sm",
      glow: "bg-emerald-400",
      icon: <User className="w-3 h-3 text-emerald-400 stroke-[2.5]" />,
    },
  };

  const c = configs[role] || configs.employee;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase border ${c.bg} ${c.text} ${c.border} transition-all duration-200 hover:scale-[1.02]`}
    >
      {c.icon}
      <span>{c.label}</span>
      <span className="relative flex h-1.5 w-1.5 ml-0.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.glow}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${c.glow}`} />
      </span>
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus | QueryStatus | string }) {
  const configs: Record<
    string,
    { label: string; bg: string; text?: string; border: string; dot: string; pulse?: boolean }
  > = {
    assigned: {
      label: "Assigned",
      bg: "bg-blue-50/90 text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
      pulse: false,
    },
    pending: {
      label: "Pending",
      bg: "bg-amber-50/90 text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      pulse: false,
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-cyan-50/90 text-cyan-800",
      border: "border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]",
      dot: "bg-cyan-500",
      pulse: true,
    },
    on_hold: {
      label: "On Hold",
      bg: "bg-purple-50/90 text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
      pulse: false,
    },
    in_review: {
      label: "In Review",
      bg: "bg-indigo-50/90 text-indigo-700",
      border: "border-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.15)]",
      dot: "bg-indigo-500",
      pulse: true,
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50/90 text-emerald-800",
      border: "border-emerald-300",
      dot: "bg-emerald-500",
      pulse: false,
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-slate-100 text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
      pulse: false,
    },
    blocked: {
      label: "Blocked",
      bg: "bg-rose-50/90 text-rose-700",
      border: "border-rose-300",
      dot: "bg-rose-500",
      pulse: true,
    },
    open: {
      label: "Open Query",
      bg: "bg-emerald-50/90 text-emerald-700",
      border: "border-emerald-300",
      dot: "bg-emerald-500",
      pulse: true,
    },
    resolved: {
      label: "Resolved",
      bg: "bg-teal-50/90 text-teal-800",
      border: "border-teal-300",
      dot: "bg-teal-500",
      pulse: false,
    },
    reopened: {
      label: "Reopened",
      bg: "bg-amber-50/90 text-amber-800",
      border: "border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]",
      dot: "bg-amber-500",
      pulse: true,
    },
    closed: {
      label: "Closed",
      bg: "bg-slate-100 text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
      pulse: false,
    },
  };

  const c =
    configs[status] || {
      label: status,
      bg: "bg-slate-100 text-slate-800",
      border: "border-slate-200",
      dot: "bg-slate-400",
      pulse: false,
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold border ${c.bg} ${c.border} transition-all`}
    >
      <span className="relative flex h-2 w-2">
        {c.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
      </span>
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
      bg: "bg-gradient-to-r from-rose-50 to-red-100/80",
      text: "text-rose-700",
      border: "border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)] animate-pulse",
      icon: <Flame className="w-3 h-3 text-rose-600 stroke-[2.5]" />,
    },
    high: {
      label: "High",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-300 shadow-2xs",
      icon: <AlertCircle className="w-3 h-3 text-amber-600 stroke-[2.5]" />,
    },
    medium: {
      label: "Medium",
      bg: "bg-sky-50",
      text: "text-sky-800",
      border: "border-sky-200",
      icon: <Clock className="w-3 h-3 text-sky-600" />,
    },
    normal: {
      label: "Normal",
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: <Clock className="w-3 h-3 text-blue-600" />,
    },
    low: {
      label: "Low",
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />,
    },
  };

  const c = configs[priority] || configs.medium;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}
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
