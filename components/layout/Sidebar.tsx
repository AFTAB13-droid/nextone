"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles,
  UserCircle2,
  Database,
  Radio,
} from "lucide-react";
import { UserRole } from "@/lib/types";

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: "/admin", label: "Executive Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Team & Hierarchy", icon: Users },
    { href: "/admin/tasks", label: "Master Task Board", icon: CheckSquare },
    { href: "/admin/queries", label: "Query Resolution", icon: HelpCircle },
    { href: "/admin/profile", label: "My Executive Profile", icon: UserCircle2 },
  ];

  const managerLinks = [
    { href: "/manager", label: "Manager Overview", icon: LayoutDashboard },
    { href: "/manager/tasks", label: "Tasks & Delegation", icon: CheckSquare },
    { href: "/manager/team", label: "My Team Roster", icon: Users },
    { href: "/manager/queries", label: "Team Queries", icon: HelpCircle },
    { href: "/manager/profile", label: "My Profile & Lead Desk", icon: UserCircle2 },
  ];

  const employeeLinks = [
    { href: "/employee", label: "My Workspace", icon: LayoutDashboard },
    { href: "/employee/tasks", label: "My Assigned Tasks", icon: CheckSquare },
    { href: "/employee/queries", label: "Ask Manager (Queries)", icon: HelpCircle },
    { href: "/employee/profile", label: "My Contributor Profile", icon: UserCircle2 },
  ];

  const links =
    role === "admin"
      ? adminLinks
      : role === "manager"
      ? managerLinks
      : employeeLinks;

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3 bg-slate-950/80 backdrop-blur-md">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base text-white tracking-wider">NextOne</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              v2.5
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Enterprise Operations</p>
        </div>
      </div>

      {/* Role Navigation */}
      <div className="flex-1 py-6 px-3.5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">
            {role.toUpperCase()} CONSOLE
          </p>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                }`}
              />
              <span className="truncate">{link.label}</span>
              {isActive && (
                <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Pill: Cloud Connection Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">Atlas Cloud</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Live Sync Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
