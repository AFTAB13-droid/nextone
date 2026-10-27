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
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  GitFork,
  Target,
  Shield,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nexton.com");
  const [password, setPassword] = useState("Nexton@2025");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "manager" | "employee">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const demoAccounts = {
    admin: {
      email: "admin@nexton.com",
      pass: "Nexton@2025",
      name: "Vikram Malhotra",
      title: "Managing Director • Executive Console",
      badge: "Executive",
    },
    manager: {
      email: "priya.sharma@nexton.com",
      pass: "Nexton@2025",
      name: "Priya Sharma",
      title: "Senior Operations Lead • Team Management",
      badge: "Manager",
    },
    employee: {
      email: "aarav.patel@nexton.com",
      pass: "Nexton@2025",
      name: "Aarav Patel",
      title: "Operations Executive • Contributor Workspace",
      badge: "Employee",
    },
  };

  const handleSelectRole = (role: "admin" | "manager" | "employee") => {
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].pass);
    setError(null);
    setIsShake(false);
  };

  const triggerWrongPasswordError = (msg: string) => {
    setError(msg);
    setIsShake(true);
    setTimeout(() => {
      setIsShake(false);
    }, 600);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      triggerWrongPasswordError("Please provide work credentials to authenticate");
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
        throw new Error(data.error || "Authentication rejected: Invalid password or email");
      }

      // Role-based routing
      const role = data.user.role;
      if (role === "admin") router.push("/admin");
      else if (role === "manager") router.push("/manager");
      else router.push("/employee");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      triggerWrongPasswordError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    setSeedNotice(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedNotice("Atlas cloud database restored with Indian demo accounts!");
        handleSelectRole("admin");
      } else {
        setError(data.error || "Failed to initialize demo database");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error connecting to cloud cluster";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-login-mesh font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* ================= AMBIENT DYNAMIC BACKGROUND GLOW ORBS ================= */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-gradient-to-tr from-indigo-400/25 via-purple-300/20 to-cyan-200/15 rounded-full blur-3xl pointer-events-none animate-morph-1" />
      <div className="absolute top-1/3 -right-24 w-[580px] h-[580px] bg-gradient-to-bl from-cyan-400/25 via-indigo-300/20 to-purple-300/15 rounded-full blur-3xl pointer-events-none animate-morph-2" />
      <div className="absolute -bottom-36 left-1/3 w-[640px] h-[640px] bg-gradient-to-tr from-purple-400/20 via-pink-200/15 to-indigo-300/20 rounded-full blur-3xl pointer-events-none animate-soft-float" />

      {/* ================= LEFT HERO COLUMN: ARCHITECTURAL LIGHT GRADIENT ================= */}
      <div className="w-full lg:w-1/2 min-h-[480px] lg:min-h-screen bg-gradient-to-br from-white/95 via-indigo-50/60 to-white/80 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-indigo-100/80 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative shrink-0 z-10">
        
        {/* Subtle Watermark Behind Branding */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Branding */}
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 ring-2 ring-white">
              <Layers className="w-5 h-5 drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl text-slate-900 tracking-tight">Nexton</span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-800 border border-indigo-200 shadow-2xs">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Operations & Task Governance</p>
            </div>
          </div>
        </div>

        {/* Main Hero Showcase */}
        <div className="my-auto py-8 lg:py-12 space-y-7 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Unified Operations Workspace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.16]">
              Empower your team with <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 bg-clip-text text-transparent">
                clarity & accountability.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
              Nexton brings organizational initiatives, managerial delegation, and daily employee targets together in a streamlined, real-time enterprise platform.
            </p>
          </div>

          {/* 3 Interactive Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/90 border border-indigo-100/90 shadow-sm hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 backdrop-blur-md group">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">3-Tier Hierarchy</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Clear separation across Directors, Managers, and Contributors.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-indigo-100/90 shadow-sm hover:shadow-md hover:border-cyan-300 hover:-translate-y-1 transition-all duration-200 backdrop-blur-md group">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <GitFork className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Task Delegation</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Decompose corporate goals into subtasks with full lifecycle audit logs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-indigo-100/90 shadow-sm hover:shadow-md hover:border-teal-300 hover:-translate-y-1 transition-all duration-200 backdrop-blur-md group">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Target className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Daily Targets</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Daily commitments, progress logs, and managerial review workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Hero Trust Telemetry */}
        <div className="pt-4 border-t border-indigo-100/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-medium relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>High-Availability Cloud Cluster</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIGN-IN COLUMN ================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10">
        
        {/* Subtle Decorative Orbital Ring behind the login card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <div className="w-[580px] h-[580px] rounded-full border border-indigo-300/20 animate-spin-slow" />
          <div className="w-[420px] h-[420px] rounded-full border border-cyan-300/15 animate-spin-slow-reverse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Clean Top Spacer (Top right badges removed per client request) */}
        <div className="w-full h-4 sm:h-8" />

        {/* ================= CENTER AUTH CARD: EXPANDED LENGTH & WIDTH ================= */}
        <div className="w-full max-w-xl lg:max-w-2xl mx-auto my-auto py-4 sm:py-8 z-10 relative">
          
          {/* Card Container with Dynamic Glow, Glassmorphism, Rounded 36px, and Overflow-Hidden */}
          <div
            className={`relative rounded-[36px] bg-white/95 backdrop-blur-2xl p-8 sm:p-12 lg:p-14 border border-white/95 shadow-[0_30px_90px_-15px_rgba(79,70,229,0.22),0_15px_35px_-5px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 space-y-7 transition-all duration-300 overflow-hidden ${
              isShake ? "animate-shake ring-2 ring-rose-500 border-rose-300 shadow-rose-500/20" : ""
            }`}
          >
            {/* Top Animated Accent Bar - strictly clipped inside rounded container */}
            <div className="absolute top-0 inset-x-0 h-1.5 overflow-hidden rounded-t-[36px] pointer-events-none z-20">
              <div className="w-full h-full bg-gradient-to-r from-indigo-600 via-cyan-400 to-indigo-600 animate-pulse" />
            </div>

            {/* Corner Ambient Glow inside Card */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-bl from-indigo-400/15 via-cyan-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-gradient-to-tr from-purple-400/15 via-pink-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  Sign in to Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Select a 1-click persona fast-track or enter provisioned credentials
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shrink-0 self-start shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Secure Access</span>
              </div>
            </div>

            {/* Wrong Password / Auth Error Alert Banner */}
            {error && (
              <div className="relative z-10 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={handleResetDatabase}
                  className="underline text-indigo-600 hover:text-indigo-800 ml-2 shrink-0 font-extrabold text-xs"
                >
                  Reset DB
                </button>
              </div>
            )}

            {seedNotice && (
              <div className="relative z-10 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{seedNotice}</span>
              </div>
            )}

            {/* 1-Click Persona Fast Track Cards */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                  1-Click Persona Fast Track
                </label>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
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
                      className={`p-4 sm:p-4.5 rounded-2xl border text-left sm:text-center transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-600/25 scale-[1.02]"
                          : "bg-white/80 hover:bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 shadow-2xs"
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-black capitalize flex items-center justify-between sm:justify-center gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {roleKey === "admin" && (
                            <Shield className={`w-4 h-4 ${isSelected ? "text-amber-200" : "text-amber-600"}`} />
                          )}
                          {roleKey === "manager" && (
                            <GitFork className={`w-4 h-4 ${isSelected ? "text-cyan-200" : "text-cyan-600"}`} />
                          )}
                          {roleKey === "employee" && (
                            <Target className={`w-4 h-4 ${isSelected ? "text-emerald-200" : "text-emerald-600"}`} />
                          )}
                          <span>{roleKey}</span>
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3] text-white" />
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] font-semibold mt-1 truncate ${
                          isSelected ? "text-indigo-100" : "text-slate-500"
                        }`}
                      >
                        {acc.name}
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
                    placeholder="name@nexton.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm sm:text-base bg-slate-50/90 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 sm:py-4 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium transition-all shadow-inner"
                  />
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Password with Eye Toggle & Error Flash */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Bcrypt Encrypted</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full text-sm sm:text-base rounded-2xl pl-12 pr-12 py-3.5 sm:py-4 text-slate-900 focus:outline-none font-medium transition-all shadow-inner ${
                      isShake
                        ? "bg-rose-50 border-2 border-rose-500 ring-4 ring-rose-500/20"
                        : "bg-slate-50/90 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500"
                    }`}
                  />
                  <Lock
                    className={`w-5 h-5 absolute left-4 top-4 pointer-events-none transition-colors ${
                      isShake ? "text-rose-500" : "text-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl transition-colors"
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
                className="w-full py-4 sm:py-4.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl text-base sm:text-lg font-black shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 mt-3 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Nexton Console</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Policy Notice */}
            <div className="relative z-10 pt-2 text-center text-xs text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Accounts are provisioned by your system administrator</span>
            </div>
          </div>
        </div>

        {/* Bottom Right Footer */}
        <div className="w-full text-center sm:text-left text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 z-10 pt-4">
          <p>&copy; {new Date().getFullYear()} Nexton Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Enterprise Operations Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
