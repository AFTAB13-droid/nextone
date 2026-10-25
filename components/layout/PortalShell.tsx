"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AuthSession } from "@/lib/types";
import OfflineScreen from "@/components/ui/OfflineScreen";
import AmbientTracker from "@/components/telemetry/AmbientTracker";
import PushNotificationBanner from "@/components/notifications/PushNotificationBanner";
import InAppToastContainer from "@/components/notifications/InAppToastContainer";
import FirstLoginWelcomeModal from "@/components/onboarding/FirstLoginWelcomeModal";

interface PortalShellProps {
  user: AuthSession;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PortalShell({ user, title, subtitle, children }: PortalShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-portal-pattern font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* First-Time Login Celebration & Welcome Modal */}
      <FirstLoginWelcomeModal user={user} />

      {/* Real-time In-App Notification Alerts */}
      <InAppToastContainer />

      {/* Real-time Offline Connectivity Monitor */}
      <OfflineScreen />

      {/* Team Presence & Activity Tracker */}
      <AmbientTracker user={user} />

      {/* Sidebar Navigation - Fixed and Stationary */}
      <Sidebar role={user.role} user={user} />

      {/* Main Content Area - Independently Scrollable */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header user={user} title={title} subtitle={subtitle} />
        {/* Unobtrusive One-Click Desktop Push Notification Opt-in */}
        <PushNotificationBanner />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default PortalShell;
