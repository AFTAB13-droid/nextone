import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple" | "blue";
}

export function StatCard({ title, value, subtitle, icon: Icon, color = "indigo" }: StatCardProps) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50", iconBg: "bg-indigo-600", text: "text-indigo-600", ring: "ring-indigo-100" },
    emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-600", text: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-600", text: "text-amber-600", ring: "ring-amber-100" },
    rose: { bg: "bg-rose-50", iconBg: "bg-rose-600", text: "text-rose-600", ring: "ring-rose-100" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-600", text: "text-purple-600", ring: "ring-purple-100" },
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-600", text: "text-blue-600", ring: "ring-blue-100" },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${scheme.bg} flex items-center justify-center ring-4 ${scheme.ring}`}>
          <Icon className={`w-6 h-6 ${scheme.text}`} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
