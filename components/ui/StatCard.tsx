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
      cardBg: "bg-gradient-to-br from-indigo-50/90 via-white to-indigo-100/35",
      border: "border-indigo-200/80 hover:border-indigo-400",
      shadow: "shadow-indigo-500/5 hover:shadow-indigo-500/20",
      topBar: "bg-gradient-to-r from-indigo-600 via-indigo-400 to-purple-600",
      iconBg: "bg-gradient-to-br from-indigo-600 to-indigo-700",
      iconText: "text-white",
      ring: "ring-indigo-100",
      valueColor: "text-slate-900 group-hover:text-indigo-950",
      dot: "bg-indigo-500",
      badgeBg: "bg-indigo-100 text-indigo-700 border-indigo-200",
      graphicColor: "#4f46e5",
    },
    emerald: {
      cardBg: "bg-gradient-to-br from-emerald-50/90 via-white to-teal-100/35",
      border: "border-emerald-200/80 hover:border-emerald-400",
      shadow: "shadow-emerald-500/5 hover:shadow-emerald-500/20",
      topBar: "bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-500",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconText: "text-white",
      ring: "ring-emerald-100",
      valueColor: "text-slate-900 group-hover:text-emerald-950",
      dot: "bg-emerald-500",
      badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
      graphicColor: "#059669",
    },
    amber: {
      cardBg: "bg-gradient-to-br from-amber-50/90 via-white to-orange-100/35",
      border: "border-amber-200/80 hover:border-amber-400",
      shadow: "shadow-amber-500/5 hover:shadow-amber-500/20",
      topBar: "bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      iconText: "text-white",
      ring: "ring-amber-100",
      valueColor: "text-slate-900 group-hover:text-amber-950",
      dot: "bg-amber-500",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      graphicColor: "#d97706",
    },
    rose: {
      cardBg: "bg-gradient-to-br from-rose-50/90 via-white to-red-100/35",
      border: "border-rose-200/80 hover:border-rose-400",
      shadow: "shadow-rose-500/5 hover:shadow-rose-500/20",
      topBar: "bg-gradient-to-r from-rose-600 via-red-500 to-rose-600",
      iconBg: "bg-gradient-to-br from-rose-600 to-red-600",
      iconText: "text-white",
      ring: "ring-rose-100",
      valueColor: "text-slate-900 group-hover:text-rose-950",
      dot: "bg-rose-500",
      badgeBg: "bg-rose-100 text-rose-700 border-rose-200",
      graphicColor: "#e11d48",
    },
    purple: {
      cardBg: "bg-gradient-to-br from-purple-50/90 via-white to-violet-100/35",
      border: "border-purple-200/80 hover:border-purple-400",
      shadow: "shadow-purple-500/5 hover:shadow-purple-500/20",
      topBar: "bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600",
      iconBg: "bg-gradient-to-br from-purple-600 to-violet-700",
      iconText: "text-white",
      ring: "ring-purple-100",
      valueColor: "text-slate-900 group-hover:text-purple-950",
      dot: "bg-purple-500",
      badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
      graphicColor: "#9333ea",
    },
    blue: {
      cardBg: "bg-gradient-to-br from-blue-50/90 via-white to-sky-100/35",
      border: "border-blue-200/80 hover:border-blue-400",
      shadow: "shadow-blue-500/5 hover:shadow-blue-500/20",
      topBar: "bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600",
      iconBg: "bg-gradient-to-br from-blue-600 to-sky-600",
      iconText: "text-white",
      ring: "ring-blue-100",
      valueColor: "text-slate-900 group-hover:text-blue-950",
      dot: "bg-blue-500",
      badgeBg: "bg-blue-100 text-blue-700 border-blue-200",
      graphicColor: "#2563eb",
    },
    cyan: {
      cardBg: "bg-gradient-to-br from-cyan-50/90 via-white to-teal-100/35",
      border: "border-cyan-200/80 hover:border-cyan-400",
      shadow: "shadow-cyan-500/5 hover:shadow-cyan-500/20",
      topBar: "bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-600",
      iconBg: "bg-gradient-to-br from-cyan-600 to-teal-600",
      iconText: "text-white",
      ring: "ring-cyan-100",
      valueColor: "text-slate-900 group-hover:text-cyan-950",
      dot: "bg-cyan-500",
      badgeBg: "bg-cyan-100 text-cyan-700 border-cyan-200",
      graphicColor: "#0891b2",
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[26px] p-5 sm:p-6 border transition-all duration-300 group ${
        onClick ? "cursor-pointer" : "cursor-default"
      } hover:-translate-y-1 hover:shadow-xl ${scheme.cardBg} ${scheme.border} ${scheme.shadow}`}
    >
      {/* Top Ambient Accent Line */}
      <div className={`absolute top-0 inset-x-0 h-1.5 ${scheme.topBar}`} />

      {/* Decorative Vector Graphic Watermark */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.08] group-hover:opacity-[0.16] group-hover:scale-110 transition-all duration-500 translate-x-3 translate-y-3">
        {color === "emerald" ? (
          // Ascending Growth Graphic
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
            <path
              d="M10 110 L40 85 L70 95 L100 50 L130 20"
              stroke={scheme.graphicColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 110 L40 85 L70 95 L100 50 L130 20 L130 110 Z"
              fill={scheme.graphicColor}
              fillOpacity="0.15"
            />
            <circle cx="130" cy="20" r="8" fill={scheme.graphicColor} />
            <circle cx="100" cy="50" r="6" fill={scheme.graphicColor} />
            <circle cx="70" cy="95" r="5" fill={scheme.graphicColor} />
          </svg>
        ) : color === "rose" ? (
          // Alert Pulse Wave Graphic
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
            <path
              d="M10 60 Q 30 60 40 30 T 60 90 T 80 40 T 100 70 T 130 60"
              stroke={scheme.graphicColor}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="60" cy="60" r="35" stroke={scheme.graphicColor} strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="60" cy="60" r="50" stroke={scheme.graphicColor} strokeWidth="1.5" strokeDasharray="6 6" />
          </svg>
        ) : color === "amber" ? (
          // Velocity Gauge / Sprint Arc Graphic
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
            <circle cx="70" cy="60" r="45" stroke={scheme.graphicColor} strokeWidth="8" strokeDasharray="180 300" strokeLinecap="round" />
            <circle cx="70" cy="60" r="30" stroke={scheme.graphicColor} strokeWidth="4" strokeDasharray="100 200" strokeLinecap="round" />
            <circle cx="70" cy="60" r="6" fill={scheme.graphicColor} />
          </svg>
        ) : (
          // Quantum Orbital Tech Grid Graphic (Default / Indigo / Purple / Blue / Cyan)
          <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
            <circle cx="75" cy="60" r="45" stroke={scheme.graphicColor} strokeWidth="3" />
            <ellipse cx="75" cy="60" rx="60" ry="25" stroke={scheme.graphicColor} strokeWidth="2" strokeDasharray="5 5" transform="rotate(-25 75 60)" />
            <ellipse cx="75" cy="60" rx="60" ry="25" stroke={scheme.graphicColor} strokeWidth="2" strokeDasharray="5 5" transform="rotate(35 75 60)" />
            <circle cx="75" cy="60" r="7" fill={scheme.graphicColor} />
            <circle cx="115" cy="35" r="4" fill={scheme.graphicColor} />
            <circle cx="35" cy="85" r="4" fill={scheme.graphicColor} />
          </svg>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Title & Optional Badge */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {title}
            </p>
            {badge && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${scheme.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>

          {/* Metric Value */}
          <p className={`text-3xl sm:text-4xl font-black tracking-tight transition-colors duration-200 ${scheme.valueColor}`}>
            {value}
          </p>

          {/* Subtitle with live indicator dot */}
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-600">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${scheme.dot} animate-pulse`} />
              <span className="truncate">{subtitle}</span>
            </div>
          )}
        </div>

        {/* 3D-Like Elevated Gradient Icon */}
        <div
          className={`w-12 h-12 rounded-2xl ${scheme.iconBg} ${scheme.iconText} flex items-center justify-center ring-4 ${scheme.ring} shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0`}
        >
          <Icon className="w-5 h-5 drop-shadow-xs" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
