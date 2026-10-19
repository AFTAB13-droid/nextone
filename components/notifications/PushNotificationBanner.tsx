"use client";

import React, { useState, useEffect } from "react";
import { Bell, Sparkles, X, ArrowRight } from "lucide-react";
import { requestDesktopPushPermission } from "@/lib/firebaseClient";

export function PushNotificationBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "default") {
      const dismissed = sessionStorage.getItem("nextone_dismiss_push_banner");
      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const res = await requestDesktopPushPermission();
      if (res.success) {
        setShow(false);
        window.dispatchEvent(new Event("notifications-updated"));
      } else {
        setShow(false);
      }
    } catch {
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("nextone_dismiss_push_banner", "true");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 px-4 py-2.5 text-white shadow-md animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
            <Bell className="w-4 h-4 text-indigo-300 animate-wiggle" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
              <span>Enable Laptop Desktop Notifications</span>
              <span className="hidden md:inline-flex px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                RECOMMENDED
              </span>
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Receive live task assignments, query updates, and team alerts directly on your screen even when minimized.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{loading ? "Activating..." : "Turn On Alerts"}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss for this session"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PushNotificationBanner;
