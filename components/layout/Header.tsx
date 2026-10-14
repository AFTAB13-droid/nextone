"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Bell, Sparkles, Shield, ChevronRight } from "lucide-react";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { RoleBadge } from "@/components/ui/Badge";
import { AuthSession } from "@/lib/types";
import Image from "next/image";

interface HeaderProps {
  user: AuthSession;
  title?: string;
  subtitle?: string;
}

export function Header({ user, title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initial unread count fetch
  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const profileHref = `/${user.role}/profile`;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div>
          {title && (
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Sidebar Trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-100/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/80 transition-all group"
            aria-label="Open Activity Radar"
            title="Open Activity Radar Sidebar"
          >
            <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-black text-white bg-indigo-600 rounded-full ring-2 ring-white shadow-sm animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* User Profile Pill */}
          <Link
            href={profileHref}
            title="View Executive Profile"
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all group"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-indigo-100 ring-2 ring-indigo-500/20 shadow-xs flex items-center justify-center shrink-0">
              {user.name ? (
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=6366f1&color=fff&bold=true`}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <UserIcon className="w-5 h-5 text-indigo-600" />
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {user.name}
                </span>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                {user.email}
              </p>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Sign out of portal"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sliding Notification Drawer */}
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUnreadChange={(cnt) => setUnreadCount(cnt)}
      />
    </>
  );
}

export default Header;
