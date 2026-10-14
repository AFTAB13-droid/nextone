"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Eye,
  EyeOff,
  Database,
  CheckCircle2,
  Terminal,
  Activity,
  Cpu,
  Building2,
  GitFork,
  Target,
  Zap,
  Shield,
  Check,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nextone.com");
  const [password, setPassword] = useState("NextOne@2025");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "manager" | "employee">("admin");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const demoAccounts = {
    admin: {
      email: "admin@nextone.com",
      pass: "NextOne@2025",
      name: "Executive Admin",
      title: "Full Company & Hierarchy Oversight",
      badge: "Executive Console",
    },
    manager: {
      email: "sarah.lead@nextone.com",
      pass: "NextOne@2025",
      name: "Sarah Jenkins",
      title: "Team Delegation & Task Lifecycle",
      badge: "Team Management",
    },
    employee: {
      email: "alex.dev@nextone.com",
      pass: "NextOne@2025",
      name: "Alex Rivera",
      title: "Individual Contributor & Targets",
      badge: "Contributor Workspace",
    },
  };

  const handleSelectRole = (role: "admin" | "manager" | "employee") => {
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].pass);
    setError(null);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please provide work credentials to authenticate");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication rejected");
      }

      // Role-based routing
      const role = data.user.role;
      if (role === "admin") router.push("/admin");
      else if (role === "manager") router.push("/manager");
      else router.push("/employee");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedNotice(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedNotice("Atlas cloud database seeded with sample users, tasks, and queries!");
        handleSelectRole("admin");
      } else {
        setError(data.error || "Failed to initialize demo database");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error connecting to cloud cluster";
      setError(msg);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* ================= LEFT HERO COLUMN: FULL BLEED EDGE-TO-EDGE ================= */}
      <div className="w-full lg:w-1/2 min-h-[500px] lg:min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden shrink-0">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-white tracking-wider">NextOne</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ENTERPRISE v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Operations & Task Governance OS</p>
            </div>
          </div>
        </div>

        {/* Main Hero Showcase */}
        <div className="relative z-10 my-auto py-8 lg:py-12 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hierarchical Operations Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Executive Command. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Frictionless Delegation.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
              NextOne unifies organization-wide task assignment, manager-to-employee work decomposition,
              daily commitments, and dual-tier query escalation into a single real-time console.
            </p>
          </div>

          {/* 3 Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md hover:bg-white/[0.09] transition-all">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold mb-3">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">3-Tier Hierarchy</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Admin governs managers; managers oversee assigned direct reports.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md hover:bg-white/[0.09] transition-all">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold mb-3">
                <GitFork className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Task Delegation</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Break Admin initiatives into subtasks with full lifecycle audit logs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md hover:bg-white/[0.09] transition-all">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold mb-3">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Daily Targets</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Employee commitments, progress updates, and managerial feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Hero Trust Telemetry */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Stateless Edge JWT • Bcrypt Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Live Atlas Sync Active</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIGN-IN COLUMN: FULL BLEED EDGE-TO-EDGE ================= */}
      <div className="w-full lg:w-1/2 min-h-screen bg-portal-pattern flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative">
        {/* Top Right Utilities */}
        <div className="w-full flex items-center justify-between sm:justify-end gap-3 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Atlas MongoDB Online</span>
          </div>

          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 btn-action"
            title="Seed sample data into MongoDB Atlas"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{seeding ? "Syncing..." : "Seed Demo Accounts"}</span>
          </button>
        </div>

        {/* Center Auth Card */}
        <div className="w-full max-w-lg mx-auto my-auto py-8">
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-6">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sign in to Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Select a 1-click persona fast-track or enter your provisioned credentials
              </p>
            </div>

            {/* Status alerts */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <span>{error}</span>
                <button
                  onClick={handleSeedDatabase}
                  className="underline text-indigo-600 hover:text-indigo-800 ml-2 shrink-0"
                >
                  Reset DB
                </button>
              </div>
            )}

            {seedNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{seedNotice}</span>
              </div>
            )}

            {/* 1-Click Persona Fast Track Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  1-Click Persona Fast Track
                </label>
                <span className="text-[10px] font-bold text-cyan-600">Auto-populates fields</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {(["admin", "manager", "employee"] as const).map((roleKey) => {
                  const isSelected = selectedRole === roleKey;
                  const acc = demoAccounts[roleKey];
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleSelectRole(roleKey)}
                      className={`p-3 rounded-2xl border text-center transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600/20"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
                      }`}
                    >
                      <div className="text-xs font-black capitalize tracking-tight flex items-center justify-center gap-1">
                        <span>{roleKey}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div
                        className={`text-[9px] font-semibold mt-0.5 truncate ${
                          isSelected ? "text-indigo-100" : "text-slate-400"
                        }`}
                      >
                        {acc.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@nextone.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Bcrypt Hash</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 btn-action disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Policy Notice */}
            <div className="pt-2 text-center text-[11px] text-slate-400 leading-normal border-t border-slate-100">
              Accounts are provisioned by Administrator. Self-registration is restricted.
            </div>
          </div>
        </div>

        {/* Bottom Right Footer */}
        <div className="w-full text-center sm:text-left text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 z-10 pt-4">
          <p>&copy; {new Date().getFullYear()} NextOne Inc. All Rights Reserved.</p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Zero Dead-Space Layout • Edge Responsive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
