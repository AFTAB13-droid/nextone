"use client";

import React from "react";
import { Layers, Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "full";
  message?: string;
  subtext?: string;
  fullscreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  message,
  subtext,
  fullscreen = false,
  className = "",
}: LoadingSpinnerProps) {
  // Small inline spinner for buttons or tiny cards
  if (size === "sm") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Medium spinner for cards / modal content
  if (size === "md") {
    return (
      <div className={`flex flex-col items-center justify-center py-6 gap-3 ${className}`}>
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md animate-pulse-glow" />

          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 border-r-violet-500 animate-spin" />

          {/* Inner Counter Ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-indigo-300/40 animate-orbit-reverse" />

          {/* Core Icon */}
          <div className="relative w-5 h-5 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600">
            <Layers className="w-3 h-3 animate-pulse" />
          </div>
        </div>

        {message && (
          <div className="text-center">
            <p className="text-xs font-bold text-slate-700 tracking-tight">{message}</p>
            {subtext && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtext}</p>}
          </div>
        )}
      </div>
    );
  }

  // Large & Fullscreen NextOne Trending Enterprise Loader
  const containerClasses = fullscreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl"
    : `flex flex-col items-center justify-center py-16 px-4 w-full ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center">
        {/* Soft Ambient Radial Halo */}
        <div className="absolute w-36 h-36 bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-sky-400/15 rounded-full blur-2xl animate-pulse-glow pointer-events-none" />

        {/* Multi-tier Quantum Orbit Rings */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer Gradient Track Ring */}
          <div className="absolute inset-0 rounded-full border-[2.5px] border-slate-100 ring-1 ring-slate-200/50" />

          {/* Orbital Kinetic Arc */}
          <div
            className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-indigo-600 border-r-violet-500 animate-spin"
            style={{ animationDuration: "1.2s" }}
          />

          {/* Secondary Counter Orbital Arc */}
          <div
            className="absolute inset-2.5 rounded-full border-2 border-transparent border-b-sky-500 border-l-indigo-400 animate-orbit-reverse"
            style={{ animationDuration: "1.8s" }}
          />

          {/* Center NextOne Core Emblem */}
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 ring-2 ring-white animate-pulse-glow">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Shimmer Progress Track & Dynamic Typography */}
        <div className="mt-5 text-center flex flex-col items-center max-w-xs">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-800">
              {message || "Loading NextOne Workspace"}
            </p>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            {subtext || "Synchronizing enterprise telemetry & live records"}
          </p>

          {/* Micro Flowing Neon Progress Line */}
          <div className="mt-3.5 w-36 h-1 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/60">
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-indigo-600 to-transparent animate-shimmer-wave rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
