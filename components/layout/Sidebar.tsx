"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles,
  UserCircle2,
  Target,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Command,
  Activity,
  Zap,
} from "lucide-react";
import { UserRole, AuthSession } from "@/lib/types";
import { getUserAvatar } from "@/lib/avatarHelper";
import { RoleBadge } from "@/components/ui/Badge";

interface SidebarProps {
  role: UserRole;
  user?: AuthSession;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthSession | undefined>(user);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Restore collapsed state preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nextone_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  // Listen for profile updates to keep avatar in sidebar synced
  useEffect(() => {
    const fetchCurrentAuth = () => {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    };

    if (!user) {
      fetchCurrentAuth();
    }

    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentUser(customEvent.detail);
      } else {
        fetchCurrentAuth();
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, [user]);

  // Keyboard shortcut (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isCollapsed) setIsCollapsed(false);
        setIsSearchActive(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nextone_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Modern structured navigation groupings
  const adminGroups: NavGroup[] = [
    {
      groupTitle: "Operations & Tasks",
      items: [
        { href: "/admin", label: "Executive Dashboard", icon: LayoutDashboard, badge: "Live" },
        { href: "/admin/tasks", label: "Master Task Board", icon: CheckSquare, badge: "HQ" },
        { href: "/admin/targets", label: "Today's Targets", icon: Target },
      ],
    },
    {
      groupTitle: "Organization",
      items: [
        { href: "/admin/users", label: "Team & Hierarchy", icon: Users },
      ],
    },
    {
      groupTitle: "Workflow Desk",
      items: [
        { href: "/admin/queries", label: "Query Resolution", icon: HelpCircle },
        { href: "/admin/productivity", label: "Notes & To-dos", icon: FileText },
      ],
    },
    {
      groupTitle: "Account",
      items: [
        { href: "/admin/profile", label: "My Profile", icon: UserCircle2 },
      ],
    },
  ];

  const managerGroups: NavGroup[] = [
    {
      groupTitle: "Team Operations",
      items: [
        { href: "/manager", label: "Manager Overview", icon: LayoutDashboard, badge: "Live" },
        { href: "/manager/tasks", label: "Tasks & Delegation", icon: CheckSquare },
        { href: "/manager/targets", label: "Team Daily Targets", icon: Target },
      ],
    },
    {
      groupTitle: "Roster",
      items: [
        { href: "/manager/team", label: "My Team Roster", icon: Users },
      ],
    },
    {
      groupTitle: "Workflow Desk",
      items: [
        { href: "/manager/queries", label: "Team Queries", icon: HelpCircle },
        { href: "/manager/productivity", label: "Notes & To-dos", icon: FileText },
      ],
    },
    {
      groupTitle: "Account",
      items: [
        { href: "/manager/profile", label: "My Profile", icon: UserCircle2 },
      ],
    },
  ];

  const employeeGroups: NavGroup[] = [
    {
      groupTitle: "My Workspace",
      items: [
        { href: "/employee", label: "My Workspace", icon: LayoutDashboard, badge: "Live" },
        { href: "/employee/tasks", label: "My Assigned Tasks", icon: CheckSquare },
        { href: "/employee/targets", label: "Today's Target", icon: Target },
      ],
    },
    {
      groupTitle: "Workflow Desk",
      items: [
        { href: "/employee/queries", label: "Ask Manager (Queries)", icon: HelpCircle },
        { href: "/employee/productivity", label: "Notes & To-dos", icon: FileText },
      ],
    },
    {
      groupTitle: "Account",
      items: [
        { href: "/employee/profile", label: "My Profile", icon: UserCircle2 },
      ],
    },
  ];

  const currentGroups =
    role === "admin"
      ? adminGroups
      : role === "manager"
      ? managerGroups
      : employeeGroups;

  // Filter items by search query if active
  const filteredGroups = currentGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const effectiveUser = currentUser || user;
  const avatarSrc = getUserAvatar(effectiveUser);

  return (
    <aside
      className={`relative bg-gradient-to-b from-[#090d16] via-[#0c101d] to-[#070a12] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800/80 select-none z-40 transition-all duration-300 ease-in-out shadow-2xl ${
        isCollapsed ? "w-[72px]" : "w-[272px]"
      }`}
    >
      {/* Top Ambient Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

      {/* Brand Header & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shrink-0 z-10">
        <Link
          href={`/${role}`}
          className="flex items-center gap-3 min-w-0 group"
          title="NextOne Enterprise Platform"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300 shrink-0 ring-1 ring-white/20">
            <Layers className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#090d16]" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-white tracking-wider bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  NextOne
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide truncate">
                Enterprise Command
              </p>
            </div>
          )}
        </Link>

        {/* Morphing Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className={`p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all duration-200 shadow-sm ${
            isCollapsed ? "mx-auto mt-1" : ""
          }`}
          title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick Search & Command Bar (Expanded only) */}
      {!isCollapsed && (
        <div className="px-3.5 pt-3 pb-1 z-10 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick Jump..."
              className="w-full pl-8 pr-12 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-[10px] font-bold text-slate-400 hover:text-white"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-2 px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono font-bold text-slate-500 border border-slate-700/60 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </div>
      )}

      {/* Navigation Groups Area */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {filteredGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {/* Group Header Label */}
            {!isCollapsed ? (
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500/90">
                  {group.groupTitle}
                </span>
                {groupIdx === 0 && (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
                  </span>
                )}
              </div>
            ) : (
              <div className="w-6 h-px bg-slate-800/80 mx-auto my-2" />
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center rounded-xl text-xs font-bold transition-all duration-200 group ${
                      isCollapsed
                        ? "justify-center w-11 h-11 mx-auto"
                        : "gap-3 px-3 py-2.5"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent hover:border-slate-800/80 hover:translate-x-1"
                    }`}
                  >
                    {/* Active Accent Beacon Line */}
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-300 rounded-r-full shadow-[0_0_8px_#a5b4fc]" />
                    )}

                    {/* Nav Icon */}
                    <Icon
                      className={`shrink-0 transition-transform duration-200 ${
                        isCollapsed ? "w-5 h-5" : "w-4 h-4"
                      } ${
                        isActive
                          ? "text-white scale-110 drop-shadow-sm"
                          : "text-slate-400 group-hover:text-indigo-400 group-hover:scale-110"
                      }`}
                    />

                    {/* Nav Label & Badge (Expanded) */}
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 tracking-tight">
                          {item.label}
                        </span>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {isActive && !item.badge && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs shadow-white animate-pulse" />
                        )}
                      </>
                    )}

                    {/* Floating Tooltip Pill (Collapsed State) */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-2xl border border-slate-700/80 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 flex items-center gap-2 translate-x-1 group-hover:translate-x-0">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono">
                          {group.groupTitle}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Out-of-the-Box User Presence Dock & Telemetry Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md shrink-0 z-10">
        {!isCollapsed ? (
          <div className="space-y-2.5">
            {/* User Presence Card */}
            <Link
              href={`/${role}/profile`}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 group"
              title="View My Profile"
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-indigo-950 border border-indigo-500/30 shadow-xs flex items-center justify-center shrink-0">
                <Image
                  src={avatarSrc}
                  alt={effectiveUser?.name || "User Avatar"}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0a0d14]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {effectiveUser?.name || "Enterprise User"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <RoleBadge role={role} />
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </Link>

            {/* System Telemetry Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1 pt-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-slate-400">99.98% Latency 18ms</span>
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                AES-256
              </span>
            </div>
          </div>
        ) : (
          /* Collapsed User Presence Avatar */
          <div className="flex flex-col items-center gap-2">
            <Link
              href={`/${role}/profile`}
              className="relative w-10 h-10 rounded-xl overflow-hidden bg-indigo-950 border border-indigo-500/30 flex items-center justify-center group"
              title={`${effectiveUser?.name || "User"} (${role.toUpperCase()})`}
            >
              <Image
                src={avatarSrc}
                alt={effectiveUser?.name || "User Avatar"}
                width={40}
                height={40}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                unoptimized
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0a0d14]" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
