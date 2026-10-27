"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, ArrowLeft, Home, Layers, Radio, ShieldAlert } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-portal-pattern flex flex-col justify-between p-6 relative overflow-hidden select-none font-sans text-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-black text-base text-slate-900 tracking-wider">Nexton Portal</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>STATUS: 404_ROUTE_UNRESOLVED</span>
        </div>
      </header>

      {/* Center 404 Console */}
      <main className="w-full max-w-xl mx-auto my-auto text-center z-10 py-12">
        {/* Animated glowing badge */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-28 h-28 rounded-3xl bg-indigo-50 border-2 border-indigo-200/80 shadow-xl shadow-indigo-500/10 flex items-center justify-center animate-float text-indigo-600">
            <Compass className="w-12 h-12 stroke-[1.75]" />
          </div>
          <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black rounded-full shadow-md tracking-wider">
            ERR_404
          </div>
        </div>

        {/* Animated Headline */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Lost in Navigation?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-8">
          The requested path or resource does not exist in the Nexton Portal cluster. It may have been relocated or archived.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300/80 shadow-sm hover:shadow transition-all flex items-center gap-2 btn-action"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 btn-action"
          >
            <Home className="w-4 h-4" />
            <span>Return to Workspace</span>
          </Link>
        </div>

        {/* Telemetry info */}
        <div className="mt-12 p-3.5 rounded-2xl bg-white/70 border border-slate-200 backdrop-blur-md inline-block text-[11px] font-mono text-slate-500">
          Node: Nexton Gateway • Protocol: HTTP/2 • Handshake: Valid
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-400 py-4 z-10">
        &copy; {new Date().getFullYear()} Nexton Portal. All operations isolated and role-verified.
      </footer>
    </div>
  );
}
