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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nexton.com");
  const [password, setPassword] = useState("Nexton@2025");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "manager" | "employee">("admin");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* ================= LEFT HERO COLUMN: CLEAN LIGHT ARCHITECTURE ================= */}
      <div className="w-full lg:w-1/2 min-h-[460px] lg:min-h-screen bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-50/40 border-b lg:border-b-0 lg:border-r border-slate-200/80 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative shrink-0">
        
        {/* Top Branding */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">Nexton</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Operations & Task Governance</p>
            </div>
          </div>
        </div>

        {/* Main Hero Showcase */}
        <div className="my-auto py-8 lg:py-12 space-y-7">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Unified Operations Workspace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
              Empower your team with <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 bg-clip-text text-transparent">
                clarity & accountability.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
              Nexton brings organizational initiatives, managerial delegation, and daily employee targets together in a streamlined, real-time platform.
            </p>
          </div>

          {/* 3 Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold mb-3">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">3-Tier Hierarchy</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Clear separation across Directors, Managers, and Contributors.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-cyan-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center font-bold mb-3">
                <GitFork className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Task Delegation</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Decompose corporate goals into subtasks with full lifecycle audit logs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold mb-3">
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
        <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>High-Availability Cloud Cluster</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIGN-IN COLUMN: CLEAN LIGHT ARCHITECTURE ================= */}
      <div className="w-full lg:w-1/2 min-h-screen bg-slate-50/60 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-hidden">
        
        {/* Top Right Utilities */}
        <div className="w-full flex items-center justify-between sm:justify-end gap-3 z-10 relative">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Atlas MongoDB Online</span>
          </div>

          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Seed sample data into MongoDB Atlas"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{seeding ? "Syncing..." : "Seed Demo Accounts"}</span>
          </button>
        </div>

        {/* ================= CENTER AUTH CARD ================= */}
        <div className="w-full max-w-lg mx-auto my-auto py-6 z-10 relative">
          <div className="relative rounded-3xl bg-white p-7 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6 transition-all">
            
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Sign in to Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Select a 1-click persona fast-track or enter provisioned credentials
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shrink-0 self-start">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Secure Access</span>
              </div>
            </div>

            {/* Status alerts */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in">
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
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{seedNotice}</span>
              </div>
            )}

            {/* 1-Click Persona Fast Track Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  1-Click Persona Fast Track
                </label>
                <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-populates fields
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(["admin", "manager", "employee"] as const).map((roleKey) => {
                  const isSelected = selectedRole === roleKey;
                  const acc = demoAccounts[roleKey];
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleSelectRole(roleKey)}
                      className={`p-3.5 rounded-2xl border text-left sm:text-center transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90"
                      }`}
                    >
                      <div className="text-xs font-bold capitalize flex items-center justify-between sm:justify-center gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {roleKey === "admin" && (
                            <Shield className={`w-3.5 h-3.5 ${isSelected ? "text-amber-200" : "text-amber-600"}`} />
                          )}
                          {roleKey === "manager" && (
                            <GitFork className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-200" : "text-cyan-600"}`} />
                          )}
                          {roleKey === "employee" && (
                            <Target className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-200" : "text-emerald-600"}`} />
                          )}
                          <span>{roleKey}</span>
                        </div>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3] text-white" />
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] font-semibold mt-1 truncate ${
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
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@nexton.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                  />
                  <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Encrypted Hash</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                  />
                  <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Nexton Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Policy Notice */}
            <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Accounts are provisioned by your system administrator</span>
            </div>
          </div>
        </div>

        {/* Bottom Right Footer */}
        <div className="w-full text-center sm:text-left text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 z-10 pt-4">
          <p>&copy; {new Date().getFullYear()} Nexton Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Enterprise Operations Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
