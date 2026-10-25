"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  X,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Volume2,
} from "lucide-react";

export interface InAppToast {
  id: string;
  title: string;
  body: string;
  link?: string;
  type?: "task" | "query" | "target" | "system" | "general";
  createdAt: number;
}

// Gentle pleasant Web Audio C5-E5 chime
const playAudioAlert = () => {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First harmonic
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.09, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.08, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.52);
  } catch {
    // Audio context may be restricted before user gesture
  }
};

export function InAppToastContainer() {
  const router = useRouter();
  const [toasts, setToasts] = useState<InAppToast[]>([]);

  const addToast = useCallback((toast: Omit<InAppToast, "id" | "createdAt">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: InAppToast = {
      ...toast,
      id,
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep max 4 visible
    playAudioAlert();

    // Auto dismiss after 7.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleInAppAlert = (e: Event) => {
      const custom = e as CustomEvent<{ title: string; body: string; link?: string; type?: any }>;
      if (custom.detail) {
        addToast({
          title: custom.detail.title || "NextOne Alert",
          body: custom.detail.body || "",
          link: custom.detail.link,
          type: custom.detail.type || "general",
        });
      }
    };

    window.addEventListener("nextone-inapp-alert", handleInAppAlert);
    return () => window.removeEventListener("nextone-inapp-alert", handleInAppAlert);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl p-4 shadow-2xl shadow-indigo-950/60 text-white relative overflow-hidden group animate-in slide-in-from-top-4 fade-in duration-300"
        >
          {/* Animated top radar progress line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 animate-pulse" />

          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-3">
            {/* Animated Radar Pulse Badge */}
            <div className="relative shrink-0 mt-0.5">
              <span className="absolute -inset-1 rounded-xl bg-indigo-500/30 animate-ping pointer-events-none" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/40 border border-indigo-400/30">
                <Bell className="w-4 h-4 text-cyan-200 animate-wiggle" />
              </div>
            </div>

            {/* Notification Text Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  Live Update
                </span>
                <span className="text-[10px] text-slate-400">• Just now</span>
              </div>
              <h4 className="text-xs font-black text-slate-100 tracking-tight leading-snug">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
                {toast.body}
              </p>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center gap-2">
                {toast.link && (
                  <button
                    onClick={() => {
                      removeToast(toast.id);
                      router.push(toast.link!);
                    }}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <span>View Now</span>
                    <ArrowRight className="w-3 h-3 text-cyan-300" />
                  </button>
                )}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close Cross */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Close alert"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InAppToastContainer;
