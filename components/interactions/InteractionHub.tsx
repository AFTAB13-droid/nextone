"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Megaphone,
  Inbox,
  Send,
  Search,
  Filter,
  Plus,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Users,
  User,
  Shield,
  Eye,
  X,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
  FileText,
} from "lucide-react";
import { AuthSession, IInteraction, IUser, UserRole } from "@/lib/types";
import { getUserAvatar } from "@/lib/avatarHelper";
import { RoleBadge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface InteractionHubProps {
  currentUser: AuthSession;
}

export function InteractionHub({ currentUser }: InteractionHubProps) {
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [inboxList, setInboxList] = useState<IInteraction[]>([]);
  const [sentList, setSentList] = useState<IInteraction[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected message to view
  const [selectedMessage, setSelectedMessage] = useState<IInteraction | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | "important" | "urgent" | "media">("all");

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [targetType, setTargetType] = useState<"all" | "managers" | "team" | "custom_users">("all");
  const [targetManagerId, setTargetManagerId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaName, setMediaName] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "document" | "none">("none");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isSenderRole = currentUser.role === "admin" || currentUser.role === "manager";

  // Fetch interactions data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/interactions");
      if (res.ok) {
        const data = await res.json();
        setInboxList(data.inbox || []);
        setSentList(data.sent || []);
        setTeams(data.teams || []);
        setDirectoryUsers(data.users || []);

        // Default select the first message in inbox if none selected
        if (!selectedMessage && data.inbox && data.inbox.length > 0) {
          setSelectedMessage(data.inbox[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch interactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set default target type based on role
  useEffect(() => {
    if (currentUser.role === "manager") {
      setTargetType("team");
    } else {
      setTargetType("all");
    }
  }, [currentUser.role]);

  // Mark message as read when selected
  const handleSelectMessage = async (msg: IInteraction) => {
    setSelectedMessage(msg);

    // If viewing inbox and not yet read, mark as read
    if (activeTab === "inbox" && !msg.readBy?.includes(currentUser.userId)) {
      try {
        await fetch(`/api/interactions/${msg._id}/read`, { method: "PUT" });
        // Update local state
        setInboxList((prev) =>
          prev.map((item) =>
            item._id === msg._id
              ? { ...item, readBy: [...(item.readBy || []), currentUser.userId] }
              : item
          )
        );
      } catch (err) {
        console.error("Error marking interaction as read:", err);
      }
    }
  };

  // Upload attachment via Cloudinary
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please select a smaller file.");
      return;
    }

    const isImg = file.type.startsWith("image/");
    setIsUploadingMedia(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder: "interactions" }),
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setMediaUrl(data.url);
          setMediaName(file.name);
          setMediaType(isImg ? "image" : "document");
        } else {
          alert(data.error || "Failed to upload file");
        }
        setIsUploadingMedia(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Error uploading media file");
      setIsUploadingMedia(false);
    }
  };

  // Submit new broadcast / message
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert("Please fill in both subject and content");
      return;
    }

    if (targetType === "team" && currentUser.role === "admin" && !targetManagerId) {
      alert("Please select a manager's team to target");
      return;
    }

    if (targetType === "custom_users" && selectedUserIds.length === 0) {
      alert("Please select at least one recipient user");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        targetType,
        targetManagerId: targetType === "team" ? (currentUser.role === "manager" ? currentUser.userId : targetManagerId) : undefined,
        recipientIds: targetType === "custom_users" ? selectedUserIds : undefined,
        subject,
        content,
        priority,
        mediaUrl,
        mediaType,
        mediaName,
      };

      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIsComposeOpen(false);
        // Reset compose form
        setSubject("");
        setContent("");
        setMediaUrl("");
        setMediaName("");
        setMediaType("none");
        setSelectedUserIds([]);
        // Refresh feed & switch to sent tab
        await fetchData();
        if (isSenderRole) {
          setActiveTab("sent");
          if (data.interaction) {
            setSelectedMessage(data.interaction);
          }
        }
      } else {
        alert(data.error || "Failed to dispatch message");
      }
    } catch (err) {
      console.error(err);
      alert("Network error sending message");
    } finally {
      setIsSending(false);
    }
  };

  // Toggle user selection in custom user picker
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const currentList = activeTab === "inbox" ? inboxList : sentList;

  // Filter messages based on search and priority filter
  const filteredMessages = currentList.filter((m) => {
    const matchesSearch =
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.sender?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      filterPriority === "all" ||
      (filterPriority === "urgent" && m.priority === "urgent") ||
      (filterPriority === "important" && (m.priority === "important" || m.priority === "urgent")) ||
      (filterPriority === "media" && m.mediaUrl && m.mediaUrl !== "");

    return matchesSearch && matchesPriority;
  });

  const unreadCount = inboxList.filter(
    (m) => !m.readBy?.includes(currentUser.userId)
  ).length;

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <LoadingSpinner message="Loading Interaction Hub" subtext="Decrypting secure company broadcasts, leadership directives, and team messages" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
            <Megaphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Enterprise Interaction Hub
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                Live Broadcasts
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Direct, encrypted announcements, custom team directives, and multimedia memos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isSenderRole && (
            <button
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Broadcast / Message</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Pane Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* Left Column: Message List Feed (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Tabs & Search */}
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 space-y-3">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab("inbox");
                  if (inboxList.length > 0 && (!selectedMessage || activeTab === "sent")) {
                    setSelectedMessage(inboxList[0]);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "inbox"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-indigo-600 text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isSenderRole && (
                <button
                  onClick={() => {
                    setActiveTab("sent");
                    if (sentList.length > 0 && (!selectedMessage || activeTab === "inbox")) {
                      setSelectedMessage(sentList[0]);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "sent"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcasts Sent</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {sentList.length}
                  </span>
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages by subject or sender..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>

            {/* Priority Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(["all", "urgent", "important", "media"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterPriority(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all shrink-0 ${
                    filterPriority === filter
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                  }`}
                >
                  {filter === "media" ? "With Media" : filter}
                </button>
              ))}
            </div>
          </div>

          {/* List of Messages */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[580px]">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-700">No messages found</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  {activeTab === "inbox"
                    ? "You're all caught up! Incoming broadcasts will appear right here."
                    : "You haven't sent any broadcasts yet. Click 'New Broadcast' to get started."}
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?._id === msg._id;
                const isUnread =
                  activeTab === "inbox" && !msg.readBy?.includes(currentUser.userId);
                const senderAvatar = getUserAvatar(msg.sender);

                return (
                  <div
                    key={msg._id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 transition-all cursor-pointer relative group ${
                      isSelected
                        ? "bg-indigo-50/60 border-l-4 border-l-indigo-600"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Sender Avatar */}
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200">
                        <Image
                          src={senderAvatar}
                          alt={msg.sender?.name || "Sender"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Sender info & Date */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {msg.sender?.name || "NextOne Admin"}
                            </span>
                            <RoleBadge role={msg.senderRole} />
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Subject */}
                        <div className="flex items-center gap-2 mt-1">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse shrink-0" />
                          )}
                          <p
                            className={`text-xs truncate ${
                              isUnread
                                ? "font-black text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {msg.subject}
                          </p>
                        </div>

                        {/* Content Snippet */}
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {msg.content}
                        </p>

                        {/* Meta Tags: Target pill, Priority, Media */}
                        <div className="flex items-center gap-2 mt-2">
                          {msg.targetType === "all" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              🌐 Company-wide
                            </span>
                          )}
                          {msg.targetType === "managers" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                              👔 Leadership
                            </span>
                          )}
                          {msg.targetType === "team" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              👥 {msg.targetManagerName || "Team"}
                            </span>
                          )}
                          {msg.targetType === "custom_users" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              👤 Direct
                            </span>
                          )}

                          {msg.priority === "urgent" && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Urgent
                            </span>
                          )}

                          {msg.mediaUrl && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-indigo-600 border border-indigo-200 flex items-center gap-1 ml-auto">
                              <Paperclip className="w-2.5 h-2.5" />
                              Media
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Reader Pane (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Message Header */}
              <div className="p-6 border-b border-slate-200/80 bg-slate-50/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white ring-2 ring-indigo-500/20 shadow-sm shrink-0">
                      <Image
                        src={getUserAvatar(selectedMessage.sender)}
                        alt={selectedMessage.sender?.name || "Sender"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900">
                          {selectedMessage.sender?.name || "NextOne Executive"}
                        </h3>
                        <RoleBadge role={selectedMessage.senderRole} />
                        {selectedMessage.priority === "urgent" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs animate-pulse">
                            🚨 Urgent Broadcast
                          </span>
                        )}
                        {selectedMessage.priority === "important" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                            ⭐ Important
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {selectedMessage.sender?.email} •{" "}
                        {selectedMessage.sender?.designation || "Executive Team"}
                      </p>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500">
                          Target Audience:
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {selectedMessage.targetType === "all"
                            ? "🌐 Entire Company"
                            : selectedMessage.targetType === "managers"
                            ? "👔 All Managers"
                            : selectedMessage.targetType === "team"
                            ? `👥 ${selectedMessage.targetManagerName || "Designated Team"}`
                            : `👤 ${selectedMessage.recipientIds?.length || 1} Selected Members`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp & Read Count */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-slate-700">
                      {new Date(selectedMessage.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(selectedMessage.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {activeTab === "sent" && (
                      <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {selectedMessage.readBy?.length || 1} read receipt
                          {(selectedMessage.readBy?.length || 1) > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject Title */}
                <h2 className="text-lg font-black text-slate-900 mt-4 tracking-tight">
                  {selectedMessage.subject}
                </h2>
              </div>

              {/* Message Body Content */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>

                {/* Media Attachment Viewer */}
                {selectedMessage.mediaUrl && (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      Attachment
                    </h4>

                    {selectedMessage.mediaType === "image" ||
                    selectedMessage.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ? (
                      <div className="space-y-3">
                        <div
                          onClick={() => setLightboxImage(selectedMessage.mediaUrl || null)}
                          className="relative max-w-md h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm cursor-pointer group"
                        >
                          <Image
                            src={selectedMessage.mediaUrl}
                            alt="Broadcast Attachment"
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs backdrop-blur-2xs">
                            <Eye className="w-4 h-4" />
                            Click to View Full Resolution
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <a
                            href={selectedMessage.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Original File
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* Document / File Card */
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 max-w-md">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {selectedMessage.mediaName || "Attached Document"}
                            </p>
                            <p className="text-[10px] text-slate-400">Secure Document Attachment</p>
                          </div>
                        </div>

                        <a
                          href={selectedMessage.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
                <Megaphone className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Select a Message</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Choose any broadcast or directive from the left feed to inspect full contents and media attachments.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Broadcast Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Dispatch New Broadcast
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Send targeted messages, directives, or multimedia announcements
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendBroadcast} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Target Audience Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                  Target Audience
                </label>

                {currentUser.role === "admin" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType("all")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        targetType === "all"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      🌐 Entire Company
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType("managers")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        targetType === "managers"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      👔 All Managers
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType("team")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        targetType === "team"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      👥 Manager Team
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType("custom_users")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        targetType === "custom_users"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      👤 Custom Members
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType("team")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        targetType === "team"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      👥 My Entire Team ({directoryUsers.length} Members)
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType("custom_users")}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        targetType === "custom_users"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      👤 Select Team Members
                    </button>
                  </div>
                )}

                {/* Sub-selectors depending on targetType */}
                {targetType === "team" && currentUser.role === "admin" && (
                  <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Select Manager Team:
                    </label>
                    <select
                      value={targetManagerId}
                      onChange={(e) => setTargetManagerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600"
                    >
                      <option value="">-- Choose a Manager's Team --</option>
                      {teams.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.subordinateCount} direct subordinates)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === "custom_users" && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>Select Individual Members:</span>
                      <span className="text-indigo-600">
                        {selectedUserIds.length} Selected
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded-lg border border-slate-200">
                      {directoryUsers.map((u) => {
                        const isChecked = selectedUserIds.includes(u._id);
                        return (
                          <label
                            key={u._id}
                            className="flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleUserSelection(u._id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                              />
                              <span className="font-bold text-slate-800">{u.name}</span>
                              <RoleBadge role={u.role} />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {u.email}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                  Broadcast Priority
                </label>
                <div className="flex items-center gap-3">
                  {(["normal", "important", "urgent"] as const).map((p) => (
                    <label
                      key={p}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        priority === p
                          ? p === "urgent"
                            ? "bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-300"
                            : p === "important"
                            ? "bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-300"
                            : "bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                        className="hidden"
                      />
                      {p === "urgent" && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                      {p === "important" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Q4 Sprint Objectives & Operational Guideline"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30"
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  Directive / Message Content *
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter detailed instructions, operational guidelines, or general announcement for the team..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30 resize-none"
                />
              </div>

              {/* Media Upload Section */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  Multimedia Attachment (Optional)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleMediaUpload}
                  className="hidden"
                />

                {mediaUrl ? (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {mediaType === "image" ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                          <Image
                            src={mediaUrl}
                            alt="Media Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {mediaName || "Uploaded Media Attachment"}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium">
                          ✓ Ready to attach & broadcast
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl("");
                        setMediaName("");
                        setMediaType("none");
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingMedia}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 text-slate-600 hover:text-indigo-600 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold"
                  >
                    {isUploadingMedia ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Uploading file to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                        <span>Upload Image or Document (Cloudinary Integration)</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          PNG, JPG, WEBP, PDF up to 10MB
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSending || isUploadingMedia}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Dispatching Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High-Resolution Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={lightboxImage}
                alt="Enlarged Attachment"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractionHub;
