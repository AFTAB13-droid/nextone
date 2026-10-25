"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AuthSession } from "@/lib/types";

interface AmbientTrackerProps {
  user: AuthSession;
}

export function AmbientTracker({ user }: AmbientTrackerProps) {
  const pathname = usePathname();
  const pathnameRef = useRef<string>(pathname || "");
  const stateRef = useRef<"active" | "idle" | "background">("active");
  const lastHeartbeatTimestamp = useRef<number>(Date.now());
  const lastActiveTimestamp = useRef<number>(Date.now());
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const throttleRef = useRef<number>(0);

  // Keep pathname updated in ref without causing useEffect to re-mount
  useEffect(() => {
    pathnameRef.current = pathname || "";
  }, [pathname]);

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

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const sendHeartbeat = async (forcedState?: "active" | "idle" | "background") => {
    const uid = user?.userId || (user as any)?._id?.toString() || (user as any)?._id;
    if (!user || !uid || typeof window === "undefined") return;

    const now = Date.now();
    const elapsedSeconds = Math.min(
      Math.max(Math.round((now - lastHeartbeatTimestamp.current) / 1000), 5),
      180
    );
    lastHeartbeatTimestamp.current = now;

    const currentState = forcedState || stateRef.current;
    const currentPath = pathnameRef.current || window.location.pathname;
    const deviceInfo = getDeviceInfo();
    const clientDate = getLocalDateString();

    try {
      await fetch("/api/telemetry/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: uid,
          state: currentState,
          durationSeconds: elapsedSeconds,
          currentPath,
          deviceInfo,
          clientDate,
        }),
      });
    } catch {
      // Silent catch for background telemetry
    }
  };

  useEffect(() => {
    if (!user) return;

    const IDLE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes without input = idle
    const HEARTBEAT_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes interval saves 66% Vercel invocations

    const resetIdleTimer = () => {
      const now = Date.now();
      lastActiveTimestamp.current = now;

      // Throttle event processing to avoid high CPU work
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
          [
            JSON.stringify({
              action: "leave",
              currentPath: pathnameRef.current,
              clientDate: getLocalDateString(),
            }),
          ],
          { type: "application/json" }
        );
        navigator.sendBeacon("/api/telemetry/heartbeat", blob);
      }
    };

    const handleWindowFocus = () => {
      stateRef.current = "active";
      resetIdleTimer();
      sendHeartbeat("active");
    };

    // Attach passive activity listeners
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Initial heartbeat on mount
    sendHeartbeat("active");
    resetIdleTimer();

    // Regular interval: pulse every 3 minutes (180s)
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [user]);

  return null;
}

export default AmbientTracker;
