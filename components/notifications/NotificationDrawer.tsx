"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Trash2,
  Bell,
  Clock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Inbox,
  Volume2,
  VolumeX,
  Target as TargetIcon,
  ArrowRight,
  Zap,
  RefreshCw,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { INotification } from "@/lib/types";
import {
  requestDesktopPushPermission,
  getDesktopNotificationStatus,
  attachForegroundMessageListener,
} from "@/lib/firebaseClient";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

// Gentle pleasant Web Audio chime (no external MP3 file needed)
const playNotificationChime = () => {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
    gain2.gain.setValueAtTime(0.08, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.48);
  } catch {
    // Audio context may be restricted before user gesture
  }
};

function formatTimeAgo(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 45) return "Just now";
    if (diffSec < 90) return "1m ago";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 7200) return "1h ago";
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onUnreadChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "task" | "query" | "target" | "system">("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);

  // Desktop push notification permission status
  const [pushStatus, setPushStatus] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [isRequestingPush, setIsRequestingPush] = useState<boolean>(false);
  const [pushMessage, setPushMessage] = useState<string>("");

  // Sound toggle (persisted in localStorage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const prevUnreadRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Initialize sound preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nextone_notif_sound");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    try {
      localStorage.setItem("nextone_notif_sound", String(nextVal));
    } catch {
      // ignore
    }
    if (nextVal) playNotificationChime();
  };

  // Check desktop push permission on mount & drawer toggle
  useEffect(() => {
    getDesktopNotificationStatus().then(setPushStatus);
  }, [isOpen]);

  // Core fetch function with smart debouncing & chime
  const fetchNotifications = async (triggerChimeIfNew = true, showSpinner = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (showSpinner) setIsRefreshing(true);

    try {
      // Fetch up to 100 notifications so all user notifications are visible
      const res = await fetch("/api/notifications?limit=100", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        const list: INotification[] = data.notifications || [];
        const count: number = typeof data.unreadCount === "number" ? data.unreadCount : 0;

        // Play chime if fresh unread notifications arrived
        if (triggerChimeIfNew && soundEnabled && count > prevUnreadRef.current) {
          playNotificationChime();
        }
        prevUnreadRef.current = count;

        setNotifications(list);
        setUnreadCount(count);
        if (onUnreadChange) onUnreadChange(count);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      isFetchingRef.current = false;
      if (showSpinner) setIsRefreshing(false);
    }
  };

  // Immediate fetch when drawer opens + adaptive smart polling
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(false, false);
    }
    // High-frequency 4s poll when drawer is open, 10s when closed
    const pollInterval = isOpen ? 4000 : 10000;
    const interval = setInterval(() => fetchNotifications(true, false), pollInterval);

    return () => clearInterval(interval);
  }, [isOpen, soundEnabled]);

  // Window Focus & Visibility Change Listeners for instant wake-up
  useEffect(() => {
    const handleSync = () => fetchNotifications(false, false);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications(false, false);
    };

    window.addEventListener("notifications-updated", handleSync);
    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("notifications-updated", handleSync);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Foreground FCM listener
  useEffect(() => {
    const unsubscribe = attachForegroundMessageListener(() => {
      if (soundEnabled) playNotificationChime();
      fetchNotifications(false, false);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [soundEnabled]);

  // Keyboard Escape listener & scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleEnablePush = async () => {
    setIsRequestingPush(true);
    setPushMessage("");
    try {
      const result = await requestDesktopPushPermission();
      const updatedStatus = await getDesktopNotificationStatus();
      setPushStatus(updatedStatus);

      if (result.success) {
        setPushMessage("✓ Desktop notifications enabled! You will now receive system push alerts.");
        playNotificationChime();
      } else {
        setPushMessage(result.error || "Could not enable desktop alerts.");
      }
    } catch (err: any) {
      setPushMessage(err?.message || "Failed to request permission.");
    } finally {
      setIsRequestingPush(false);
    }
  };

  const [testingSelfPush, setTestingSelfPush] = useState(false);
  const [selfPushFeedback, setSelfPushFeedback] = useState<string>("");

  const handleTestSelfPush = async () => {
    setTestingSelfPush(true);
    setSelfPushFeedback("");
    try {
      const res = await fetch("/api/notifications/test-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelfPushFeedback("✓ Test push dispatched! In-app banner & desktop alert triggered.");
        fetchNotifications(false, false);
      } else {
        setSelfPushFeedback(data.error || "Failed to dispatch test push.");
      }
    } catch {
      setSelfPushFeedback("Network error testing push.");
    } finally {
      setTestingSelfPush(false);
    }
  };

  // Optimistic Mark All Read (0ms UI latency)
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    prevUnreadRef.current = 0;
    if (onUnreadChange) onUnreadChange(0);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications-updated"));
    }

    setLoading(true);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch (e) {
      console.error(e);
      // Re-fetch in case of network issue
      fetchNotifications(false, false);
    } finally {
      setLoading(false);
    }
  };

  // Optimistic Single Read/Unread Toggle
  const toggleReadStatus = async (id: string, currentRead: boolean) => {
    const nextRead = !currentRead;
    // Optimistic UI state update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: nextRead } : n))
    );
    const newCount = nextRead ? Math.max(0, unreadCount - 1) : unreadCount + 1;
    setUnreadCount(newCount);
    prevUnreadRef.current = newCount;
    if (onUnreadChange) onUnreadChange(newCount);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications-updated"));
    }

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, isRead: nextRead }),
      });
    } catch (e) {
      console.error(e);
      fetchNotifications(false, false);
    }
  };

  // Optimistic Delete
  const deleteNotification = async (id: string) => {
    const target = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.isRead) {
      const updatedCount = Math.max(0, unreadCount - 1);
      setUnreadCount(updatedCount);
      prevUnreadRef.current = updatedCount;
      if (onUnreadChange) onUnreadChange(updatedCount);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-updated"));
      }
    }

    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
      fetchNotifications(false, false);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    setNotifications([]);
    setUnreadCount(0);
    prevUnreadRef.current = 0;
    if (onUnreadChange) onUnreadChange(0);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications-updated"));
    }

    setClearing(true);
    try {
      await fetch("/api/notifications/clear-all", { method: "DELETE" });
    } catch (e) {
      console.error(e);
      fetchNotifications(false, false);
    } finally {
      setClearing(false);
    }
  };

  // Filter items based on active tab
  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "task") return n.type === "task";
    if (activeTab === "query") return n.type === "query";
    if (activeTab === "target") return n.type === "target";
    if (activeTab === "system") return n.type === "system" || n.type === "hierarchy";
    return true;
  });

  // Smart link resolver ensuring correct role prefix
  const resolveTargetLink = (rawLink?: string) => {
    if (!rawLink || rawLink === "/") return "";
    if (typeof window === "undefined") return rawLink;

    const path = window.location.pathname;
    let rolePrefix = "/employee";
    if (path.startsWith("/admin")) rolePrefix = "/admin";
    else if (path.startsWith("/manager")) rolePrefix = "/manager";

    // Re-route links that omit role prefix
    if (rawLink === "/interactions") return `${rolePrefix}/interactions`;
    if (rawLink === "/tasks") return `${rolePrefix}/tasks`;
    if (rawLink === "/queries") return `${rolePrefix}/queries`;
    if (rawLink === "/targets") return `${rolePrefix}/targets`;
    return rawLink;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "task":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-indigo-600" />,
          label: "Task",
          bg: "bg-indigo-50 border-indigo-200/80 text-indigo-700",
        };
      case "query":
        return {
          icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
          label: "Query",
          bg: "bg-purple-50 border-purple-200/80 text-purple-700",
        };
      case "target":
        return {
          icon: <TargetIcon className="w-4 h-4 text-emerald-600" />,
          label: "Target",
          bg: "bg-emerald-50 border-emerald-200/80 text-emerald-700",
        };
      case "hierarchy":
        return {
          icon: <Layers className="w-4 h-4 text-sky-600" />,
          label: "Team",
          bg: "bg-sky-50 border-sky-200/80 text-sky-700",
        };
      default:
        return {
          icon: <Megaphone className="w-4 h-4 text-amber-600" />,
          label: "System",
          bg: "bg-amber-50 border-amber-200/80 text-amber-700",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        {/* Upgraded Width (w-[540px] to max-w-2xl) & Light Theme */}
        <div className="w-screen max-w-xl md:max-w-2xl md:w-[560px] lg:w-[600px] bg-slate-50/95 backdrop-blur-2xl border-l border-slate-200/90 shadow-2xl flex flex-col text-slate-800 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25 ring-4 ring-indigo-50">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight text-slate-900">
                    Notifications & Activity
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-black shadow-xs">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">Real-time alerts, tasks, and team updates</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Manual Refresh Button */}
              <button
                onClick={() => fetchNotifications(false, true)}
                disabled={isRefreshing}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Refresh notifications"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
                aria-label="Toggle sound"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Close drawer (Esc)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Push Notification Banner (Light Theme) */}
          {pushStatus !== "granted" ? (
            <div className="p-4 mx-6 mt-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-violet-50/70 to-sky-50/80 border border-indigo-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900">
                    Enable Desktop Notifications
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Receive instant desktop banners for assigned tasks, manager replies, and urgent announcements even when Nexton is minimized.
                  </p>
                  <button
                    onClick={handleEnablePush}
                    disabled={isRequestingPush}
                    className="mt-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-[11px] shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{isRequestingPush ? "Activating..." : "Enable Desktop Alerts"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  {pushMessage && (
                    <p className="text-[11px] text-indigo-700 font-semibold mt-1.5">
                      {pushMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-emerald-900">Desktop Web Push Active</span>
              </div>
              <button
                onClick={handleTestSelfPush}
                disabled={testingSelfPush}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-800 hover:text-indigo-600 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
                title="Send an instant test push to verify notifications"
              >
                <Zap className={`w-3.5 h-3.5 text-indigo-600 ${testingSelfPush ? "animate-spin" : ""}`} />
                <span>{testingSelfPush ? "Dispatching..." : "Test Push"}</span>
              </button>
            </div>
          )}

          {selfPushFeedback && (
            <div className="mx-6 mt-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-800 flex items-center gap-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{selfPushFeedback}</span>
            </div>
          )}

          {/* Category Filter Pills (Light Theme) */}
          <div className="px-6 py-3 border-b border-slate-200/80 bg-white/80 flex items-center justify-between gap-2">
            {/* Scrollable category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "unread"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab("task")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "task"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("query")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "query"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                Queries
              </button>
              <button
                onClick={() => setActiveTab("target")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "target"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                Targets
              </button>
              <button
                onClick={() => setActiveTab("system")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "system"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                System
              </button>
            </div>

            {/* Mass actions */}
            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  title="Mark all as read"
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  disabled={clearing}
                  title="Clear all notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center mb-3.5 text-slate-400">
                  <Inbox className="w-7 h-7 stroke-1" />
                </div>
                <h4 className="text-sm font-black text-slate-800">All caught up!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  {activeTab === "unread"
                    ? "You have zero unread notifications."
                    : "No notifications found in this category."}
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const badge = getTypeBadge(item.type);
                const targetLink = resolveTargetLink(item.link);

                return (
                  <div
                    key={item._id}
                    className={`p-4 rounded-2xl transition-all duration-200 border group relative ${
                      !item.isRead
                        ? "bg-white border-l-4 border-l-indigo-600 border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300"
                        : "bg-white/70 border-slate-200/70 hover:bg-white hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Type Badge Icon */}
                      <div className={`mt-0.5 p-2 rounded-xl shrink-0 border ${badge.bg}`}>
                        {badge.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header Row: Category Pill, Title, Pulsing Unread Dot */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                              {badge.label}
                            </span>
                            <p className="text-xs font-black text-slate-900 truncate">
                              {item.title}
                            </p>
                          </div>
                          {!item.isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 ring-4 ring-indigo-100 animate-pulse" />
                          )}
                        </div>

                        {/* Notification Body */}
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.message}
                        </p>

                        {/* Footer Row: Timestamp & Actions */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatTimeAgo(item.createdAt)}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Toggle Read */}
                            <button
                              onClick={() => toggleReadStatus(item._id, item.isRead)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            >
                              {item.isRead ? "Mark unread" : "Mark read"}
                            </button>

                            {/* View Action Link */}
                            {targetLink && (
                              <Link
                                href={targetLink}
                                onClick={onClose}
                                className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 border border-indigo-200/70 shadow-2xs"
                              >
                                <span>View</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => deleteNotification(item._id)}
                              title="Delete notification"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="px-6 py-3 bg-white/90 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing {filtered.length} of {notifications.length} notifications</span>
            <span className="text-indigo-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationDrawer;
