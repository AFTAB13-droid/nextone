"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { IUser } from "@/lib/types";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { getUserAvatar } from "@/lib/avatarHelper";
import {
  UserCheck,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  User,
  Phone,
  Building2,
  Briefcase,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";

interface EditUserModalProps {
  user: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setDepartment(user.department || "");
      setDesignation(user.designation || "");
      setPhone(user.phone || "");
      setIsActive(user.isActive ?? true);
      setNewPassword("");
      setError(null);
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        department: department.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        isActive,
      };

      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
      }

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      onUserUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating account";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions: CustomSelectOption[] = [
    {
      value: "active",
      label: "Active (Full Access Granted)",
      badge: "Enabled",
      description: "User can authenticate and interact with tasks and queries",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      value: "inactive",
      label: "Deactivated (Access Suspended)",
      badge: "Disabled",
      description: "User is blocked from signing in until reactivated",
      icon: <XCircle className="w-4 h-4 text-rose-600" />,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Account: ${user.name}`}
      description={`Update role profile, account activation status, or reset credentials (${user.email})`}
      maxWidth="xl"
    >
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* User Mini Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 mb-5 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 ring-2 ring-indigo-500/20 shrink-0">
          <Image
            src={getUserAvatar(user)}
            alt={user.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-slate-900 truncate">{user.name}</h4>
          <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Legal Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Department
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Core Engineering, Product Operations"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Designation / Title
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
              />
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <CustomSelect
              label="Account Access Status"
              value={isActive ? "active" : "inactive"}
              onChange={(val) => setIsActive(val === "active")}
              options={statusOptions}
            />
          </div>
        </div>

        {/* Reset Password Field with Eye Toggle */}
        <div className="p-4 sm:p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Reset User Password
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Leave blank to keep current</span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new secure password (e.g. Nexton@2025)..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl pl-10 pr-12 py-3 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-mono transition-all"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-1 rounded-xl transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 btn-action"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditUserModal;
