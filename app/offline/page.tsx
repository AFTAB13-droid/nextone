"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WifiOff, RefreshCw, ArrowLeft, Home, Layers, Radio } from "lucide-react";

export default function OfflinePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [statusText, setStatusText] = useState("Offline - Waiting for signal");

  const handleTestConnection = () => {
    setChecking(true);
    setStatusText("Pinging gateway...");
    setTimeout(() => {
      if (typeof window !== "undefined" && window.navigator.onLine) {
        setStatusText("Online! Redirecting...");
        router.push("/");
      } else {
        setChecking(false);
        setStatusText("Still offline. Please check your Wi-Fi or mobile data.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-portal-pattern flex flex-col justify-between p-6 relative overflow-hidden select-none font-sans text-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-black text-base text-slate-900 tracking-wider">NextOne Portal</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>NETWORK: OFFLINE</span>
        </div>
      </header>

      {/* Center Offline Console */}
      <main className="w-full max-w-xl mx-auto my-auto text-center z-10 py-12">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-28 h-28 rounded-3xl bg-rose-50 border-2 border-rose-200/80 shadow-xl shadow-rose-500/10 flex items-center justify-center animate-float text-rose-600">
            <WifiOff className="w-12 h-12 stroke-[1.75]" />
          </div>
          <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-black rounded-full shadow-md tracking-wider">
            NET_DOWN
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
          Connection Link Lost
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-4">
          NextOne could not establish a connection to the internet. Please verify your network cables, router, or mobile data settings.
        </p>

        <p className="text-xs font-mono text-slate-400 mb-8">{statusText}</p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleTestConnection}
            disabled={checking}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 btn-action disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Checking Network..." : "Check Connection"}</span>
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
            <span>Try Return Home</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-slate-400 py-4 z-10">
        &copy; {new Date().getFullYear()} NextOne Portal. Client offline detection active.
      </footer>
    </div>
  );
}
