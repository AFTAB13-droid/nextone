"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Layers, ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export function OfflineScreen() {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        setDismissed(false);
      };
      const handleOffline = () => {
        setIsOffline(true);
        setDismissed(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        if (window.navigator.onLine) {
          setIsOffline(false);
          setDismissed(false);
        } else {
          setChecking(false);
        }
      }
    }, 1200);
  };

  if (!isOffline || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Wi-Fi Disconnect Graphic */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center animate-pulse">
            <WifiOff className="w-10 h-10" />
          </div>
          <span className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
            DISCONNECTED
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          No Internet Connection
        </h3>
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mx-auto mb-6">
          Your device appears to be offline. Nexton requires an active network link to synchronize real-time tasks, targets, and internal queries.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={checking}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 btn-action disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Testing Network..." : "Check Connection Again"}</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Work in Offline Cache
          </button>
        </div>

        {/* Telemetry pill */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Status: NETWORK_UNAVAILABLE • Protocol: TCP_OFFLINE</span>
        </div>
      </div>
    </div>
  );
}

export default OfflineScreen;
