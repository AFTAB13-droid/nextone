"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import ProductivityView from "@/components/productivity/ProductivityView";
import { AuthSession } from "@/lib/types";

export default function AdminProductivityPage() {
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
        <LoadingSpinner fullscreen message="Loading Notes & Workspace" subtext="Accessing encrypted personal scratchpad and checklist storage" />
      </div>
    );
  }

  return (
    <PortalShell
      user={currentUser}
      title="Personal Notes & To-dos"
      subtitle="Strictly private workspace for personal thoughts, quick reminders, and daily check-lists"
    >
      <ProductivityView currentUser={currentUser} />
    </PortalShell>
  );
}
