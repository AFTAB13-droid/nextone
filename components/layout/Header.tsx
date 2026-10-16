"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Bell, Sparkles, Shield, ChevronRight, PanelLeft } from "lucide-react";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { RoleBadge } from "@/components/ui/Badge";
import { AuthSession } from "@/lib/types";
import { getUserAvatar } from "@/lib/avatarHelper";
import Image from "next/image";

interface HeaderProps {
  user: AuthSession;
  title?: string;
  subtitle?: string;
}

export function Header({ user, title, subtitle }: HeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthSession>(user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync currentUser with latest profile from DB and listen to updates
  useEffect(() => {
    const fetchCurrentAuth = () => {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setCurrentUser((prev) => ({ ...prev, ...data.user }));
          }
        })
        .catch(() => {});
    };

    fetchCurrentAuth();

    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentUser((prev) => ({ ...prev, ...customEvent.detail }));
      } else {
        fetchCurrentAuth();
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, []);

  // Initial unread count fetch and live synchronization
  useEffect(() => {
    const fetchUnread = () => {
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    };

    fetchUnread();
    window.addEventListener("notifications-updated", fetchUnread);
    return () => window.removeEventListener("notifications-updated", fetchUnread);
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

  const profileHref = `/${currentUser.role}/profile`;
  const avatarSrc = getUserAvatar(currentUser);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("toggle-sidebar"));
              }
            }}
            className="p-2 rounded-xl bg-slate-100/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/80 transition-all group shrink-0"
            aria-label="Toggle Navigation Sidebar"
            title="Toggle Navigation Sidebar (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
          <div>
            {title && (
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Out-of-the-box Activity Radar Bell Trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-100/90 hover:bg-indigo-50/90 text-slate-600 hover:text-indigo-600 border border-slate-200/80 hover:border-indigo-200/90 transition-all duration-200 group shadow-xs active:scale-95"
            aria-label="Open Activity Radar"
            title="Open Notification Radar & Live Feed"
          >
            {/* Live radar sonar ping when unread notifications exist */}
            {unreadCount > 0 && (
              <span className="absolute -inset-0.5 rounded-xl bg-indigo-500/25 animate-ping pointer-events-none opacity-75" />
            )}

            <Bell className={`w-4 h-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 ${
              unreadCount > 0 ? "text-indigo-600 animate-wiggle" : "text-slate-600"
            }`} />

            {/* Futuristic glowing badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-black text-white bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 rounded-full ring-2 ring-white shadow-md shadow-indigo-500/40">
                <span className="relative z-10">{unreadCount > 99 ? "99+" : unreadCount}</span>
                <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse pointer-events-none" />
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* User Profile Pill */}
          <Link
            href={profileHref}
            title="View Profile"
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all group"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-indigo-100 ring-2 ring-indigo-500/20 shadow-xs flex items-center justify-center shrink-0">
              {currentUser.name ? (
                <Image
                  src={avatarSrc}
                  alt={currentUser.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <UserIcon className="w-5 h-5 text-indigo-600" />
              )}
            </div>

            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {currentUser.name}
                </span>
                <RoleBadge role={currentUser.role} />
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                {currentUser.email}
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
