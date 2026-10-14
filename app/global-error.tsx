"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw, Layers } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Root Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans antialiased">
        <div className="w-full max-w-md bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Root Execution Fault</h2>
            <p className="text-xs text-slate-400 mt-1">
              A foundational framework exception was intercepted at the top level.
            </p>
          </div>

          {error?.message && (
            <p className="p-3 rounded-xl bg-slate-900 text-rose-300 font-mono text-xs text-left break-all border border-slate-800">
              {error.message}
            </p>
          )}

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application Core</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
