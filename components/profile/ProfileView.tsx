"use client";

import React, { useState, useEffect, useRef } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RoleBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import { ImageCropperModal } from "@/components/profile/ImageCropperModal";
import {
  UserCircle2,
  Mail,
  Phone,
  Building,
  Briefcase,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Camera,
  Layers,
  Database,
  ArrowRight,
  TrendingUp,
  Upload,
} from "lucide-react";
import { AuthSession, IUser } from "@/lib/types";
import Image from "next/image";
import FirstLoginWelcomeModal from "@/components/onboarding/FirstLoginWelcomeModal";

interface ProfileStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  inReviewTasks: number;
  completionRate: number;
  delegatedTasksCount: number;
  totalQueries: number;
}

export function ProfileView() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [profileData, setProfileData] = useState<IUser | null>(null);
  const [subordinates, setSubordinates] = useState<IUser[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    inReviewTasks: 0,
    completionRate: 100,
    delegatedTasksCount: 0,
    totalQueries: 0,
  });

  const [activeTab, setActiveTab] = useState<"overview" | "security" | "team">("overview");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Photo Cropper & Resizer States
  const [selectedRawImage, setSelectedRawImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isSavingCroppedAvatar, setIsSavingCroppedAvatar] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [changingPass, setChangingPass] = useState(false);
  const [showWelcomePreview, setShowWelcomePreview] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const [meRes, profileRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/profile"),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (profileRes.ok) {
        const pd = await profileRes.json();
        setProfileData(pd.user);
        setSubordinates(pd.subordinates || []);
        if (pd.stats) setStats(pd.stats);
        setName(pd.user.name || "");
        setPhone(pd.user.phone || "");
        setAvatarUrl(pd.user.avatar || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatar: avatarUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileData(data.user);
        setIsEditingInfo(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("profile-updated", { detail: data.user }));
        }
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAvatarDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedRawImage(base64);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCroppedAvatarComplete = async (croppedBase64: string) => {
    setIsSavingCroppedAvatar(true);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: croppedBase64, folder: "user_avatars" }),
      });
      const uploadData = await uploadRes.json();
      const finalUrl = uploadData.url || croppedBase64;

      // Save to user profile
      const profRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: finalUrl }),
      });
      if (profRes.ok) {
        const pd = await profRes.json();
        setProfileData(pd.user);
        setAvatarUrl(finalUrl);
        setIsCropperOpen(false);
        setSelectedRawImage(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("profile-updated", { detail: pd.user }));
        }
      } else {
        const errJson = await profRes.json();
        alert(errJson.error || "Failed to update profile avatar");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading and saving cropped avatar");
    } finally {
      setIsSavingCroppedAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error changing password";
      setPassMessage({ type: "error", text: msg });
    } finally {
      setChangingPass(false);
    }
  };

  if (loading || !currentUser || !profileData) {
    return (
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner fullscreen message="Loading Executive Profile" subtext="Decrypting secure identity credentials and personal metrics" />
      </div>
    );
  }

  const managerObj =
    typeof profileData.managerId === "object" && profileData.managerId
      ? (profileData.managerId as IUser)
      : null;

  return (
    <PortalShell
      user={currentUser}
      title="User Identity & Command Profile"
      subtitle="Executive credentials, organizational hierarchy, and live performance metrics"
    >
      {/* Hidden Device File Picker */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarDeviceUpload}
      />

      {/* Hero Profile Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl mb-8">
        {/* Decorative Header Art */}
        <div className="h-44 sm:h-52 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 relative p-6 flex items-start justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black tracking-wider uppercase">
              {profileData.role.toUpperCase()} IDENTITY
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active System Session
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-mono z-10 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Atlas ID: #{profileData._id.slice(-8)}</span>
          </div>
        </div>

        {/* User Card Content */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar with click-to-upload from device */}
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-800 border-4 border-slate-900 shadow-2xl shrink-0 group cursor-pointer"
              title="Click to upload profile photo from your device"
            >
              <Image
                src={getUserAvatar(profileData)}
                alt={profileData.name}
                width={128}
                height={128}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-black gap-1 text-center p-2">
                <Camera className="w-5 h-5 text-cyan-300" />
                <span>{uploadingAvatar ? "Uploading..." : "Change Picture"}</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {profileData.name}
                </h2>
                <RoleBadge role={profileData.role} />
              </div>
              <p className="text-sm font-semibold text-indigo-400">
                {profileData.designation} • {profileData.department}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{profileData.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2 w-full sm:w-auto">
            {/* Direct Device Upload Button */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 btn-action disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{uploadingAvatar ? "Uploading..." : "Upload Photo"}</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Security Settings
            </button>
            <button
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-colors flex items-center justify-center gap-1.5"
            >
              {isEditingInfo ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Edit Info Drawer Form */}
        {isEditingInfo && (
          <form
            onSubmit={handleUpdateInfo}
            className="p-6 bg-slate-950 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                placeholder="e.g. Aarav Sharma"
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number (India)</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Custom Photo URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingInfo}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md"
              >
                {savingInfo ? "Saving..." : "Save Identity Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Profile Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Workspace & Performance
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "security"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security & Password Change
        </button>

        {profileData.role !== "admin" && (
          <button
            onClick={() => setActiveTab("team")}
            className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "team"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Organizational Reporting
          </button>
        )}
      </div>

      {/* TAB 1: WORKSPACE & PERFORMANCE */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Performance Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Assigned Deliverables
              </p>
              <p className="text-3xl font-black text-slate-900">{stats.totalTasks}</p>
              <p className="text-[11px] text-slate-500 mt-1">{stats.activeTasks} currently active</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Completed & Approved
              </p>
              <p className="text-3xl font-black text-emerald-600">{stats.completedTasks}</p>
              <p className="text-[11px] text-slate-500 mt-1">{stats.inReviewTasks} in review</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                On-Time Rate
              </p>
              <p className="text-3xl font-black text-indigo-600">{stats.completionRate}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Lifecycle delivery score</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Inquiries & Tickets
              </p>
              <p className="text-3xl font-black text-purple-600">{stats.totalQueries}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {profileData.role === "manager" ? `${subordinates.length} supervised` : "Raised to lead"}
              </p>
            </div>
          </div>

          {/* Details Row: Contact Info & Reporting Chain */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Identity Attributes
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Email:</span>
                  <span className="font-mono text-slate-800">{profileData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Phone:</span>
                  <span className="text-slate-800">{profileData.phone || "Not set"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Department:</span>
                  <span className="font-bold text-slate-800">{profileData.department}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-semibold">Designation:</span>
                  <span className="font-bold text-slate-800">{profileData.designation}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 font-semibold">Member Since:</span>
                  <span className="text-slate-600">
                    {new Date(profileData.createdAt).toLocaleDateString([], {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Reporting Manager or Subordinates Quick Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Organizational Hierarchy
              </h3>

              {profileData.role === "employee" ? (
                managerObj ? (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white ring-2 ring-indigo-200 shrink-0">
                      <Image
                        src={getUserAvatar(managerObj)}
                        alt={managerObj.name}
                        width={48}
                        height={48}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                        Designated Reporting Manager
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {managerObj.name}
                      </h4>
                      <p className="text-xs text-slate-500">{managerObj.designation}</p>
                      <p className="text-[11px] font-mono text-indigo-600 mt-0.5">
                        {managerObj.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 italic">
                    You currently report directly to Company Admin.
                  </p>
                )
              ) : profileData.role === "manager" ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    You lead {subordinates.length} team members assigned by Admin.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subordinates.map((sub) => (
                      <span
                        key={sub._id}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  As Executive Admin, you hold company-wide oversight over all operational units,
                  departments, managers, and employee task delegations.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD CHANGE (With Show/Hide Eye Toggle) */}
      {activeTab === "security" && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              Update Account Password
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your account uses a strong, unique password to safeguard company data
            </p>
          </div>

          {passMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                passMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {passMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{passMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password with Eye toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password with Eye toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              {changingPass ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          {/* Onboarding & Workplace Policy Agreement */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Workplace Onboarding & Policy Agreement
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Status:{" "}
                  {profileData.firstLoginCompleted ? (
                    <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Completed & Policies Accepted
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      Pending First Login Onboarding
                    </span>
                  )}
                </p>
                {profileData.privacyPolicyAcceptedAt && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Consent Logged: {new Date(profileData.privacyPolicyAcceptedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowWelcomePreview(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Preview Induction Pop-up</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATIONAL REPORTING */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {profileData.role === "manager" ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Team Members Reporting to You ({subordinates.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subordinates.map((s) => (
                  <div
                    key={s._id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={getUserAvatar(s)}
                        alt={s.name}
                        width={40}
                        height={40}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{s.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{s.designation}</p>
                      <p className="text-[10px] text-indigo-600 font-mono mt-0.5 truncate">
                        {s.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 text-center text-xs text-slate-500">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Supervision Structure</h4>
              <p>
                You are registered as an individual contributor. Deliverables are submitted to your
                reporting manager for review and signoff.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Profile Photo Cropper & Resizer Modal */}
      <ImageCropperModal
        imageSrc={selectedRawImage}
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setSelectedRawImage(null);
        }}
        onCropComplete={handleCroppedAvatarComplete}
        isSaving={isSavingCroppedAvatar}
      />

      {/* Induction & Celebration Modal Preview */}
      {showWelcomePreview && currentUser && (
        <FirstLoginWelcomeModal
          user={currentUser}
          forceOpen={true}
          onClose={() => setShowWelcomePreview(false)}
        />
      )}
    </PortalShell>
  );
}

export default ProfileView;
