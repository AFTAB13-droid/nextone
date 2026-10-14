import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple" | "blue" | "cyan";
}

export function StatCard({ title, value, subtitle, icon: Icon, color = "indigo" }: StatCardProps) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50", iconBg: "bg-indigo-600", text: "text-indigo-600", ring: "ring-indigo-100/80", border: "hover:border-indigo-300" },
    emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-600", text: "text-emerald-600", ring: "ring-emerald-100/80", border: "hover:border-emerald-300" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-600", text: "text-amber-600", ring: "ring-amber-100/80", border: "hover:border-amber-300" },
    rose: { bg: "bg-rose-50", iconBg: "bg-rose-600", text: "text-rose-600", ring: "ring-rose-100/80", border: "hover:border-rose-300" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-600", text: "text-purple-600", ring: "ring-purple-100/80", border: "hover:border-purple-300" },
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-600", text: "text-blue-600", ring: "ring-blue-100/80", border: "hover:border-blue-300" },
    cyan: { bg: "bg-cyan-50", iconBg: "bg-cyan-600", text: "text-cyan-600", ring: "ring-cyan-100/80", border: "hover:border-cyan-300" },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`glass-card rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-default relative overflow-hidden ${scheme.border}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-2xl ${scheme.bg} flex items-center justify-center ring-4 ${scheme.ring} shadow-inner group-hover:scale-110 transition-transform duration-300 shrink-0`}
        >
          <Icon className={`w-5 h-5 ${scheme.text}`} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
