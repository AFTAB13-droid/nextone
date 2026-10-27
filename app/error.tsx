"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, ArrowLeft, Home, Layers, ShieldX } from "lucide-react";

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Portal runtime error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-portal-pattern flex flex-col justify-between p-6 relative overflow-hidden select-none font-sans text-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-black text-base text-slate-900 tracking-wider">Nexton Portal</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700 font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>FAULT_DETECTED: 500_RUNTIME</span>
        </div>
      </header>

      {/* Center 500 Console */}
      <main className="w-full max-w-xl mx-auto my-auto text-center z-10 py-12">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-28 h-28 rounded-3xl bg-rose-50 border-2 border-rose-200/80 shadow-xl shadow-rose-500/10 flex items-center justify-center animate-float text-rose-600">
            <ShieldX className="w-12 h-12 stroke-[1.75]" />
          </div>
          <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[11px] font-black rounded-full shadow-md tracking-wider">
            ERR_500
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
          System Interruption
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-6">
          An unhandled exception occurred in the portal engine. Our error monitoring system has registered this event.
        </p>

        {/* Error Detail Pill */}
        {error?.message && (
          <div className="mb-8 p-3.5 rounded-2xl bg-white border border-rose-200 text-xs font-mono text-rose-700 max-w-md mx-auto text-left break-all shadow-xs">
            <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">Diagnostic Signature:</span>
            {error.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 btn-action"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => router.back()}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300/80 shadow-sm transition-all flex items-center gap-2 btn-action"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center gap-2 btn-action"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-400 py-4 z-10">
        &copy; {new Date().getFullYear()} Nexton Portal. System isolation safeguards intact.
      </footer>
    </div>
  );
}
