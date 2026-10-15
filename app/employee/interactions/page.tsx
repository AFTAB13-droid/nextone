"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { InteractionHub } from "@/components/interactions/InteractionHub";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthSession } from "@/lib/types";

export default function EmployeeInteractionsPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner
          fullscreen
          message="Loading Inbox & Broadcasts"
          subtext="Fetching directives and announcements from managers and leadership"
        />
      </div>
    );
  }

  return (
    <PortalShell
      user={currentUser}
      title="Inbox & Broadcasts"
      subtitle="Receive directives, multimedia memos, and company-wide announcements"
    >
      <InteractionHub currentUser={currentUser} />
    </PortalShell>
  );
}
