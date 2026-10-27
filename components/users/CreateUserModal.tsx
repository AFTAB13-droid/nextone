"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { IUser, UserRole } from "@/lib/types";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { getUserAvatar } from "@/lib/avatarHelper";
import {
  UserPlus,
  AlertTriangle,
  Shield,
  Briefcase,
  Users,
  User,
  Sparkles,
  Phone,
  Mail,
  Lock,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Nexton@2025");
  const [role, setRole] = useState<UserRole>("employee");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [managerId, setManagerId] = useState<string>("");
  const [department, setDepartment] = useState("Engineering");
  const [designation, setDesignation] = useState("Senior Software Engineer");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [managers, setManagers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setManagerId(""); // Always default to Unassigned
    const fetchManagers = async () => {
      try {
        const res = await fetch("/api/users?role=manager");
        if (res.ok) {
          const data = await res.json();
          const mgrList: IUser[] = data.users || [];
          setManagers(mgrList);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchManagers();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in full name, official email, and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role,
          gender,
          managerId: role === "employee" ? managerId || null : null,
          department: department.trim(),
          designation: designation.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to provision user");
      }

      setName("");
      setEmail("");
      setPassword("Nexton@2025");
      onUserCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating user account";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: CustomSelectOption[] = [
    {
      value: "employee",
      label: "Employee",
      badge: "Employee",
      description: "Direct contributor reporting to an assigned operations manager",
      icon: <Users className="w-4 h-4 text-cyan-600" />,
    },
    {
      value: "manager",
      label: "Manager",
      badge: "Manager",
      description: "Delegates tasks, oversees direct reports, and manages query resolutions",
      icon: <Shield className="w-4 h-4 text-indigo-600" />,
    },
  ];

  const genderOptions: CustomSelectOption[] = [
    {
      value: "male",
      label: "Male (Assigns Male Professional Avatar)",
      badge: "Male Avatar",
      icon: (
        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200">
          <Image
            src="/avatars/man-1.svg"
            alt="Male"
            width={20}
            height={20}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ),
    },
    {
      value: "female",
      label: "Female (Assigns Female Professional Avatar)",
      badge: "Female Avatar",
      icon: (
        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200">
          <Image
            src="/avatars/woman-1.svg"
            alt="Female"
            width={20}
            height={20}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ),
    },
    {
      value: "other",
      label: "Neutral / Other (Standard Professional Monogram)",
      badge: "Neutral",
      icon: (
        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-slate-200">
          <Image
            src="/avatars/champion-1.svg"
            alt="Neutral"
            width={20}
            height={20}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ),
    },
  ];

  const managerOptions: CustomSelectOption[] = [
    {
      value: "",
      label: "None (Create as Unassigned)",
      badge: "Optional",
      description: "Employee will be unassigned. Admin can assign to any manager later.",
      icon: <Users className="w-4 h-4 text-slate-400" />,
    },
    ...managers.map((m) => ({
      value: m._id,
      label: m.name,
      badge: m.department || "Operations",
      description: `${m.designation || "Lead"} • ${m.email}`,
      icon: (
        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
          <Image
            src={getUserAvatar(m)}
            alt={m.name}
            width={20}
            height={20}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ),
    })),
  ];

  // Dynamic Avatar Preview using clean SVG avatars
  const previewAvatar =
    gender === "female"
      ? "/avatars/woman-1.svg"
      : gender === "other"
      ? "/avatars/champion-1.svg"
      : "/avatars/man-1.svg";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Enterprise User"
      description="Executive Provisioning: Generate enterprise credentials and map hierarchy within Nexton"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm font-bold text-rose-700 flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Identity & Avatar Preview Strip */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-cyan-50/40 to-slate-50 border border-indigo-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white ring-2 ring-indigo-500/20 shadow-md shrink-0">
              <Image
                src={previewAvatar}
                alt="Avatar Preview"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  {name ? name : "Aarav Sharma"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                  {gender} Avatar Assigned
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {designation} • {department}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Active on Creation</span>
          </div>
        </div>

        {/* Name and Official Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Official Work Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. aarav.sharma@nexton.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Password and Role Custom Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Temporary Provision Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-mono font-bold transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <CustomSelect
              label="Organizational Role"
              required
              value={role}
              onChange={(val) => {
                const newRole = val as UserRole;
                setRole(newRole);
                if (newRole !== "employee") {
                  setManagerId("");
                }
              }}
              options={roleOptions}
            />
          </div>
        </div>

        {/* Gender Selection (For Automatic Default Avatar) */}
        <div>
          <CustomSelect
            label="Gender (Used for Executive Avatar Mapping)"
            value={gender}
            onChange={(val) => setGender(val as "male" | "female" | "other")}
            options={genderOptions}
          />
        </div>

        {/* Manager selector if role is Employee */}
        {role === "employee" ? (
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assign Direct Reporting Manager (Optional)
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </div>
            <CustomSelect
              label=""
              value={managerId}
              onChange={(val) => setManagerId(val)}
              options={managerOptions}
              searchable
            />
            <p className="text-[11px] text-slate-500 font-medium">
              💡 Leave as &ldquo;None (Create as Unassigned)&rdquo; to assign this employee to a manager whenever you want later.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Manager Role:</strong> Reports directly to Corporate Leadership. No manager assignment required.
            </span>
          </div>
        )}

        {/* Department and Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Operational Department
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Contact Number (India Standard)
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
            className="px-6 py-3 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 btn-action"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Provisioning..." : "Provision User Account"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateUserModal;
