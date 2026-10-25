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
  Filter,
  Volume2,
  VolumeX,
  Target as TargetIcon,
  Send,
  ShieldAlert,
  ArrowRight,
  Flame,
  Zap,
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

export function NotificationDrawer({
  isOpen,
  onClose,
  onUnreadChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "task" | "query" | "target" | "system">("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);

  // Desktop push notification permission status
  const [pushStatus, setPushStatus] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [isRequestingPush, setIsRequestingPush] = useState<boolean>(false);
  const [pushMessage, setPushMessage] = useState<string>("");

  // Sound toggle (persisted in localStorage)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const prevUnreadRef = useRef<number>(0);

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

  // Check desktop push permission on mount
  useEffect(() => {
    getDesktopNotificationStatus().then(setPushStatus);
  }, [isOpen]);

  const fetchNotifications = async (triggerChimeIfNew = true) => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        const count = data.unreadCount || 0;

        // Play subtle chime if new unread notifications arrived
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
    }
  };

  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => fetchNotifications(true), 15000); // 15s poll
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Foreground FCM listener
  useEffect(() => {
    const unsubscribe = attachForegroundMessageListener((payload) => {
      if (soundEnabled) playNotificationChime();
      fetchNotifications(false);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [soundEnabled]);

  // Keyboard Escape listener
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
        setSelfPushFeedback("✓ Dispatched! In-app notification card popped up on screen & push alert sent.");
      } else {
        setSelfPushFeedback(data.error || "Failed to dispatch test push.");
      }
    } catch {
      setSelfPushFeedback("Network error testing push.");
    } finally {
      setTestingSelfPush(false);
    }
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      prevUnreadRef.current = 0;
      if (onUnreadChange) onUnreadChange(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentRead: boolean) => {
    try {
      const nextRead = !currentRead;
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, isRead: nextRead }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: nextRead } : n))
      );
      const newCount = nextRead ? Math.max(0, unreadCount - 1) : unreadCount + 1;
      setUnreadCount(newCount);
      prevUnreadRef.current = newCount;
      if (onUnreadChange) onUnreadChange(newCount);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.isRead) {
          const updatedCount = Math.max(0, unreadCount - 1);
          setUnreadCount(updatedCount);
          prevUnreadRef.current = updatedCount;
          if (onUnreadChange) onUnreadChange(updatedCount);
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    setClearing(true);
    try {
      await fetch("/api/notifications/clear-all", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadRef.current = 0;
      if (onUnreadChange) onUnreadChange(0);
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "task") return n.type === "task";
    if (activeTab === "query") return n.type === "query";
    if (activeTab === "target") return n.type === "target";
    if (activeTab === "system") return n.type === "system" || n.type === "hierarchy";
    return true;
  });

  const getTypeIcon = (type: string, isRead: boolean) => {
    switch (type) {
      case "task":
        return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
      case "query":
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case "target":
        return <TargetIcon className="w-4 h-4 text-emerald-400" />;
      case "hierarchy":
        return <Layers className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-cyan-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white">Notifications & Activity</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-black shadow-2xs">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Real-time updates and push alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={soundEnabled ? "Mute notification chime" : "Enable notification chime"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close drawer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Push Prompt Banner (if not already granted) */}
          {pushStatus !== "granted" ? (
            <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white">
                    Enable Desktop Web Push
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Receive compulsory desktop alerts for assigned tasks, manager replies, and urgent directives even when NextOne is minimized.
                  </p>
                  <button
                    onClick={handleEnablePush}
                    disabled={isRequestingPush}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-[11px] shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                  >
                    <span>{isRequestingPush ? "Activating..." : "Enable Desktop Alerts"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  {pushMessage && (
                    <p className="text-[10px] text-indigo-300 font-semibold mt-1.5">
                      {pushMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-4 mt-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-slate-200">Desktop Web Push Active</span>
              </div>
              <button
                onClick={handleTestSelfPush}
                disabled={testingSelfPush}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                title="Send an instant test push to your desktop"
              >
                <Zap className={`w-3.5 h-3.5 text-cyan-300 ${testingSelfPush ? "animate-spin" : ""}`} />
                <span>{testingSelfPush ? "Dispatching..." : "Test Push"}</span>
              </button>
            </div>
          )}

          {selfPushFeedback && (
            <div className="mx-4 mt-2 p-2.5 rounded-xl bg-indigo-900/60 border border-indigo-500/40 text-[11px] font-semibold text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{selfPushFeedback}</span>
            </div>
          )}

          {/* Quick Actions & Category Filter Pills */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs gap-2">
            {/* Scrollable Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ${
                  activeTab === "all"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ${
                  activeTab === "unread"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab("task")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ${
                  activeTab === "task"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("query")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ${
                  activeTab === "query"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Queries
              </button>
              <button
                onClick={() => setActiveTab("target")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ${
                  activeTab === "target"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Targets
              </button>
            </div>

            {/* Mass actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  disabled={clearing}
                  title="Clear all notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-4 space-y-2.5">
            {filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mb-3 text-slate-400">
                  <Inbox className="w-6 h-6 stroke-1" />
                </div>
                <h4 className="text-sm font-black text-slate-300">All clear!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  {activeTab === "unread"
                    ? "You have zero unread notifications. You are all caught up."
                    : "No notifications found in this view."}
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl transition-all duration-200 border group relative ${
                    !item.isRead
                      ? "bg-gradient-to-r from-indigo-950/45 via-slate-900 to-slate-900/90 border-indigo-500/35 shadow-sm hover:border-indigo-400/60"
                      : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0">
                      {getTypeIcon(item.type, item.isRead)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-black text-white truncate">{item.title}</p>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 ring-4 ring-indigo-500/20 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/70 text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          {/* Toggle read */}
                          <button
                            onClick={() => toggleReadStatus(item._id, item.isRead)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            {item.isRead ? "Mark unread" : "Mark read"}
                          </button>

                          {/* Jump Link */}
                          {item.link && (
                            <Link
                              href={item.link}
                              onClick={onClose}
                              className="px-2.5 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-[10px] transition-all flex items-center gap-1 border border-indigo-500/30"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}

                          {/* Delete single notification */}
                          <button
                            onClick={() => deleteNotification(item._id)}
                            title="Delete notification"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationDrawer;
