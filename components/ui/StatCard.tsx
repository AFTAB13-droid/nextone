import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple" | "blue" | "cyan";
  badge?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "indigo",
  badge,
  onClick,
}: StatCardProps) {
  const colorMap = {
    indigo: {
      cardBg: "bg-white",
      border: "border-slate-200/80 hover:border-indigo-300",
      topBar: "bg-indigo-600",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      valueColor: "text-slate-900 group-hover:text-indigo-950",
      dot: "bg-indigo-500",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    emerald: {
      cardBg: "bg-white",
      border: "border-slate-200/80 hover:border-emerald-300",
      topBar: "bg-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      valueColor: "text-slate-900 group-hover:text-emerald-950",
      dot: "bg-emerald-500",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    amber: {
      cardBg: "bg-white",
      border: "border-slate-200/80 hover:border-amber-300",
      topBar: "bg-amber-500",
      iconBg: "bg-amber-50 text-amber-700 border-amber-100",
      valueColor: "text-slate-900 group-hover:text-amber-950",
      dot: "bg-amber-500",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    },
    rose: {
      cardBg: "bg-white",
      border: "border-slate-200/80 hover:border-rose-300",
      topBar: "bg-rose-500",
      iconBg: "bg-rose-50 text-rose-600 border-rose-100",
      valueColor: "text-slate-900 group-hover:text-rose-950",
      dot: "bg-rose-500",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    },
    purple: {
      cardBg: "bg-white",
      border: "border-slate-200/80 hover:border-purple-300",
      topBar: "bg-purple-600",
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
      valueColor: "text-slate-900 group-hover:text-purple-950",
      dot: "bg-purple-500",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    },
    blue: {
      cardBg: "bg-white",
      border: "border-slate-200/80 hover:border-blue-300",
      topBar: "bg-blue-600",
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      valueColor: "text-slate-900 group-hover:text-blue-950",
      dot: "bg-blue-500",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    cyan: {
      cardBg: "bg-white",
      border: "border-slate-200/80 hover:border-cyan-300",
      topBar: "bg-cyan-500",
      iconBg: "bg-cyan-50 text-cyan-700 border-cyan-100",
      valueColor: "text-slate-900 group-hover:text-cyan-950",
      dot: "bg-cyan-500",
      badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 sm:p-5 border shadow-xs transition-all duration-200 group ${
        onClick ? "cursor-pointer" : "cursor-default"
      } hover:-translate-y-0.5 hover:shadow-md ${scheme.cardBg} ${scheme.border}`}
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${scheme.topBar}`} />

      {/* Main Content Layout */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Title & Optional Badge */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {title}
            </p>
            {badge && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${scheme.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>

          {/* Metric Value */}
          <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-200 ${scheme.valueColor}`}>
            {value}
          </p>

          {/* Subtitle with clean dot */}
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${scheme.dot}`} />
              <span className="truncate">{subtitle}</span>
            </div>
          )}
        </div>

        {/* Clean Tinted Icon */}
        <div
          className={`w-10 h-10 rounded-xl ${scheme.iconBg} border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
