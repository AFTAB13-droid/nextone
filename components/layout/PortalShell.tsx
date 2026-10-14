"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AuthSession } from "@/lib/types";
import OfflineScreen from "@/components/ui/OfflineScreen";

interface PortalShellProps {
  user: AuthSession;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PortalShell({ user, title, subtitle, children }: PortalShellProps) {
  return (
    <div className="flex min-h-screen bg-portal-pattern font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Real-time Offline Connectivity Monitor */}
      <OfflineScreen />

      {/* Sidebar Navigation */}
      <Sidebar role={user.role} />

      {/* Main Content Area - 100% Fluid Edge-to-Edge (Zero Dead Margins) */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} title={title} subtitle={subtitle} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default PortalShell;
