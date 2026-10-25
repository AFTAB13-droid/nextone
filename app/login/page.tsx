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
              <p className="text-xs text-slate-400 font-medium">Team Operations & Task Workspace</p>
            </div>
          </div>
        </div>

        {/* Main Hero Showcase */}
        <div className="relative z-10 my-auto py-8 lg:py-12 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Team Collaboration & Workflow Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Clear Leadership. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Seamless Delegation.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
              NextOne unifies organization-wide task assignment, manager-to-employee work decomposition,
              daily commitments, and team query resolution into a single real-time console.
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
                Admins guide managers; managers lead assigned team members.
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
      <div className="w-full lg:w-1/2 min-h-screen bg-portal-pattern flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        
        {/* ================= BACKGROUND GRAPHICS BEHIND CARD ================= */}
        {/* 1. Large Animated Glowing Mesh Orbs */}
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] bg-gradient-to-bl from-indigo-500/20 via-cyan-400/15 to-transparent rounded-full blur-3xl pointer-events-none animate-morph-1" />
        <div className="absolute -bottom-24 -left-20 w-[480px] h-[480px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none animate-morph-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/5 via-cyan-400/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 2. High-Tech Rotating Geometric Tech Rings / Dial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          {/* Outer dashed spinning ring */}
          <svg className="w-[680px] h-[680px] text-indigo-300/30 animate-spin-slow" viewBox="0 0 680 680" fill="none">
            <circle cx="340" cy="340" r="320" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
            <circle cx="340" cy="340" r="280" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" />
            <circle cx="340" cy="340" r="240" stroke="currentColor" strokeWidth="1" strokeDasharray="16 16" />
          </svg>
          {/* Inner counter-rotating ring with compass points */}
          <svg className="w-[500px] h-[500px] text-cyan-400/25 animate-spin-slow-reverse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 6" />
            <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
          </svg>
        </div>

        {/* 3. Floating Enterprise Telemetry Badges Behind/Beside Card */}
        {/* Floating Badge 1 - Top Left */}
        <div className="absolute top-8 left-6 sm:left-12 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-md animate-float z-10">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="w-4 h-4 rounded-full bg-emerald-400/40 absolute animate-ping" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cloud Operations</div>
            <div className="text-xs font-bold text-slate-800">99.98% High Availability</div>
          </div>
        </div>

        {/* Floating Badge 2 - Bottom Right */}
        <div className="absolute bottom-12 right-6 sm:right-12 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-md animate-float-delayed z-10">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Security Architecture</div>
            <div className="text-xs font-bold text-slate-800">Bcrypt + Stateless JWT</div>
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="w-full flex items-center justify-between sm:justify-end gap-3 z-10 relative">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Atlas MongoDB Online</span>
          </div>

          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white border border-slate-200/90 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 btn-action"
            title="Seed sample data into MongoDB Atlas"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{seeding ? "Syncing..." : "Seed Demo Accounts"}</span>
          </button>
        </div>

        {/* ================= CENTER AUTH CARD: LARGE, PROMINENT & ROUNDED ================= */}
        <div className="w-full max-w-xl 2xl:max-w-2xl mx-auto my-auto py-6 sm:py-10 z-10 relative">
          
          {/* Card Container with High-End Rounded Shape & Glowing Borders */}
          <div className="relative rounded-[32px] sm:rounded-[40px] bg-white/95 backdrop-blur-2xl p-7 sm:p-11 lg:p-12 border-2 border-white shadow-[0_30px_90px_-20px_rgba(79,70,229,0.18),0_15px_35px_-10px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/90 overflow-hidden space-y-6 sm:space-y-7 transition-all">
            
            {/* Animated Background Graphics INSIDE the Card */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent blur-2xl pointer-events-none animate-morph-1" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-tl from-cyan-400/20 via-teal-400/10 to-transparent blur-2xl pointer-events-none animate-morph-2" />
            
            {/* Animated Shimmer Line at Top of Card */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 bg-[length:200%_auto] animate-[shimmer_3s_infinite_linear]" />

            {/* Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  Sign in to Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Select a 1-click persona fast-track or enter provisioned credentials
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shrink-0 self-start">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Enterprise RBAC</span>
              </div>
            </div>

            {/* Status alerts */}
            {error && (
              <div className="relative z-10 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in">
                <span>{error}</span>
                <button
                  onClick={handleSeedDatabase}
                  className="underline text-indigo-600 hover:text-indigo-800 ml-2 shrink-0 font-extrabold"
                >
                  Reset DB
                </button>
              </div>
            )}

            {seedNotice && (
              <div className="relative z-10 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{seedNotice}</span>
              </div>
            )}

            {/* 1-Click Persona Fast Track Cards */}
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  1-Click Persona Fast Track
                </label>
                <span className="text-xs font-bold text-cyan-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  Auto-populates fields
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["admin", "manager", "employee"] as const).map((roleKey) => {
                  const isSelected = selectedRole === roleKey;
                  const acc = demoAccounts[roleKey];
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleSelectRole(roleKey)}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left sm:text-center transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500/30 scale-[1.02]"
                          : "bg-slate-50/80 hover:bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      <div className="text-sm font-black capitalize tracking-tight flex items-center justify-between sm:justify-center gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {roleKey === "admin" && <Shield className="w-4 h-4 text-amber-300" />}
                          {roleKey === "manager" && <GitFork className="w-4 h-4 text-cyan-300" />}
                          {roleKey === "employee" && <Target className="w-4 h-4 text-emerald-300" />}
                          <span>{roleKey}</span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3] text-white" />
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] sm:text-[11px] font-semibold mt-1 truncate ${
                          isSelected ? "text-indigo-100" : "text-slate-500"
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
            <form onSubmit={handleLogin} className="relative z-10 space-y-5 pt-1">
              {/* Email */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Work Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@nextone.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm sm:text-base bg-slate-50/90 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 sm:py-4 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all shadow-inner"
                  />
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Secure Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Bcrypt Encrypted Hash</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm sm:text-base bg-slate-50/90 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 sm:py-4 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all shadow-inner"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl text-sm sm:text-base font-extrabold shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 btn-action disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Executive Console</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Policy Notice */}
            <div className="relative z-10 pt-2 text-center text-xs text-slate-400 leading-normal border-t border-slate-100 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Accounts are provisioned by Administrator. Self-registration is restricted.</span>
            </div>
          </div>
        </div>

        {/* Bottom Right Footer */}
        <div className="w-full text-center sm:text-left text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 z-10 pt-4">
          <p>&copy; {new Date().getFullYear()} NextOne Inc. All Rights Reserved.</p>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Zero Dead-Space
            </span>
            <span>•</span>
            <span>High-DPI Fluid Layout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
