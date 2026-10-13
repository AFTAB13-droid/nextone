"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { INotification } from "@/lib/types";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onUnreadChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "task" | "query">("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        const count = data.unreadCount || 0;
        setNotifications(list);
        setUnreadCount(count);
        if (onUnreadChange) onUnreadChange(count);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s poll
    return () => clearInterval(interval);
  }, []);

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

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
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
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
      case "query":
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case "hierarchy":
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-sky-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white">Activity Radar</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-extrabold shadow-sm">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Real-time team updates & alert logs</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "unread"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab("task")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "task"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("query")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === "query"
                    ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Queries
              </button>
            </div>

            {/* Mass actions */}
            <div className="flex items-center gap-2">
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
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mb-3 text-slate-400">
                  <Inbox className="w-6 h-6 stroke-1" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">All clear!</h4>
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
                  className={`p-3.5 rounded-2xl transition-all border group relative ${
                    !item.isRead
                      ? "bg-gradient-to-r from-indigo-950/40 to-slate-900 border-indigo-500/30 shadow-sm"
                      : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-xl bg-slate-800 border border-slate-700/60 shrink-0">
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 ring-4 ring-indigo-500/20" />
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[11px]">
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
