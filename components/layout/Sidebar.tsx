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
  ];

  const managerLinks = [
    { href: "/manager", label: "Manager Overview", icon: LayoutDashboard },
    { href: "/manager/tasks", label: "Tasks & Delegation", icon: CheckSquare },
    { href: "/manager/team", label: "My Team Roster", icon: Users },
    { href: "/manager/queries", label: "Team Queries", icon: HelpCircle },
  ];

  const employeeLinks = [
    { href: "/employee", label: "My Workspace", icon: LayoutDashboard },
    { href: "/employee/tasks", label: "My Assigned Tasks", icon: CheckSquare },
    { href: "/employee/queries", label: "Ask Manager (Queries)", icon: HelpCircle },
  ];

  const links =
    role === "admin"
      ? adminLinks
      : role === "manager"
      ? managerLinks
      : employeeLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white tracking-wider">NextOne</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              v2.5
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Enterprise Workspace</p>
        </div>
      </div>

      {/* Role Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1">
        <div className="px-3 mb-3">
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            {role.toUpperCase()} PORTAL
          </p>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Pill */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">NextOne Cloud</p>
            <p className="text-[10px] text-slate-400">Role-Based Access Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
