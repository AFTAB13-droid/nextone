"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import ProductivityView from "@/components/productivity/ProductivityView";
import { AuthSession } from "@/lib/types";

export default function ManagerProductivityPage() {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PortalShell
      user={currentUser}
      title="Personal Notes & To-dos"
      subtitle="Private executive scratchpad for sprint planning, meeting notes, and personal checklists"
    >
      <ProductivityView currentUser={currentUser} />
    </PortalShell>
  );
}
