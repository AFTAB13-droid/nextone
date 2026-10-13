"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AuthSession } from "@/lib/types";

interface PortalShellProps {
  user: AuthSession;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PortalShell({ user, title, subtitle, children }: PortalShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar role={user.role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default PortalShell;
