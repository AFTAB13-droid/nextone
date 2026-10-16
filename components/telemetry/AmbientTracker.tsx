"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AuthSession } from "@/lib/types";

interface AmbientTrackerProps {
  user: AuthSession;
}

export function AmbientTracker({ user }: AmbientTrackerProps) {
  const pathname = usePathname();
  const stateRef = useRef<"active" | "idle" | "background">("active");
  const lastActiveTimestamp = useRef<number>(Date.now());
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const throttleRef = useRef<number>(0);

  // Detect OS & Browser
  const getDeviceInfo = () => {
    if (typeof window === "undefined") return {};
    const ua = navigator.userAgent;
    let os = "Desktop";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    let browser = "Browser";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    return { os, browser, screenResolution };
  };

  const sendHeartbeat = async (forcedState?: "active" | "idle" | "background") => {
    if (!user || !user.userId || typeof window === "undefined") return;

    const currentState = forcedState || stateRef.current;
    const currentPath = pathname || window.location.pathname;
    const deviceInfo = getDeviceInfo();

    try {
      await fetch("/api/telemetry/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: currentState,
          durationSeconds: 60,
          currentPath,
          deviceInfo,
        }),
      });
    } catch {
      // Silent failure for telemetry
    }
  };

  useEffect(() => {
    if (!user) return;

    const IDLE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes without input = idle

    const resetIdleTimer = () => {
      const now = Date.now();
      lastActiveTimestamp.current = now;

      // Throttle event processing to avoid CPU work
      if (now - throttleRef.current < 4000) return;
      throttleRef.current = now;

      if (document.visibilityState === "visible") {
        if (stateRef.current !== "active") {
          stateRef.current = "active";
          sendHeartbeat("active");
        }
      }

      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      idleTimeoutRef.current = setTimeout(() => {
        if (document.visibilityState === "visible") {
          stateRef.current = "idle";
          sendHeartbeat("idle");
        }
      }, IDLE_THRESHOLD_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stateRef.current = "background";
        sendHeartbeat("background");
      } else {
        const timeSinceActive = Date.now() - lastActiveTimestamp.current;
        if (timeSinceActive > IDLE_THRESHOLD_MS) {
          stateRef.current = "idle";
          sendHeartbeat("idle");
        } else {
          stateRef.current = "active";
          sendHeartbeat("active");
        }
      }
    };

    const handleBeforeUnload = () => {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob(
          [JSON.stringify({ action: "leave", currentPath: pathname })],
          { type: "application/json" }
        );
        navigator.sendBeacon("/api/telemetry/heartbeat", blob);
      }
    };

    // Attach passive activity listeners
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Initial heartbeat on mount
    sendHeartbeat("active");
    resetIdleTimer();

    // Periodic heartbeat every 60 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 60 * 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [user, pathname]);

  return null; // Silent background component
}

export default AmbientTracker;
