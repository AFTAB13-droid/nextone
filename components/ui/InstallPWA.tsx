"use client";

import React, { useState, useEffect } from "react";
import { Download, Sparkles, Monitor, CheckCircle, ArrowRight } from "lucide-react";

interface InstallPWAProps {
  variant?: "sidebar" | "sidebar_collapsed" | "banner";
}

export function InstallPWA({ variant = "sidebar" }: InstallPWAProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installFeedback, setInstallFeedback] = useState<string>("");

  useEffect(() => {
    // 1. Register sw.js for PWA compliance if needed
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration("/").then((reg) => {
        if (!reg) {
          navigator.serviceWorker.register("/sw.js").catch(() => {});
        }
      });
    }

    // 2. Check if already installed & running in standalone mode
    if (typeof window !== "undefined") {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }
    }

    // 3. Listen for native browser PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) {
      setInstallFeedback("✓ NextOne is already installed on your PC!");
      setTimeout(() => setInstallFeedback(""), 4000);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setIsInstallable(false);
          setIsInstalled(true);
        }
      } catch (err) {
        console.error("PWA install error:", err);
      }
    } else {
      // Guide user to click Chrome's native omnibox install icon
      setInstallFeedback("💡 Look for the Install icon (⊕ / 💻) in your Chrome address bar (top-right)!");
      setTimeout(() => setInstallFeedback(""), 6000);
    }
  };

  // If already running in standalone desktop app window, hide the install button
  if (isInstalled) return null;

  if (variant === "sidebar_collapsed") {
    return (
      <button
        onClick={handleInstallClick}
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-600/30 group relative"
        title="Install NextOne Desktop App"
        aria-label="Install App"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
          Install Desktop App
        </div>
      </button>
    );
  }

  return (
    <div className="px-3 py-2">
      <button
        onClick={handleInstallClick}
        className="w-full relative group overflow-hidden rounded-xl p-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:brightness-110 active:scale-[0.98] transition-all border border-indigo-400/30"
      >
        {/* Animated sheen */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform pointer-events-none" />

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-xs">
            <Monitor className="w-4 h-4 text-cyan-200" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-[11px] tracking-wide">INSTALL APP</span>
              <span className="px-1 py-0.2 rounded text-[8px] font-black bg-cyan-400/30 text-cyan-200 border border-cyan-400/40">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-indigo-100 font-normal">Desktop software view</p>
          </div>
        </div>

        <Download className="w-4 h-4 text-cyan-200 group-hover:translate-y-0.5 transition-transform" />
      </button>

      {installFeedback && (
        <p className="mt-1.5 px-1 text-[10px] font-semibold text-indigo-700 animate-in fade-in duration-200">
          {installFeedback}
        </p>
      )}
    </div>
  );
}

export default InstallPWA;
