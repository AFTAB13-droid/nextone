"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { RoleBadge } from "@/components/ui/Badge";
import { AuthSession } from "@/lib/types";
import Image from "next/image";

interface HeaderProps {
  user: AuthSession;
  title?: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export function Header({ user, title, subtitle }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div>
        {title && <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <NotificationBell />

        <div className="h-6 w-px bg-slate-200" />

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-indigo-100 ring-2 ring-indigo-50 flex items-center justify-center shrink-0">
            {user.name ? (
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{user.name}</span>
              <RoleBadge role={user.role} />
            </div>
            <p className="text-[11px] text-slate-500">{user.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
