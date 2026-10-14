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
  KeyRound,
  Radio,
  Building2,
  GitFork,
  Target,
  HelpCircle,
  Zap,
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
      roleText: "Full Operational & Hierarchy Oversight",
      badge: "Executive",
      color: "from-indigo-600 to-indigo-700",
    },
    manager: {
      email: "sarah.lead@nextone.com",
      pass: "NextOne@2025",
      name: "Sarah Jenkins",
      roleText: "Team Tasks Delegation & Delivery Lead",
      badge: "Team Lead",
      color: "from-blue-600 to-cyan-600",
    },
    employee: {
      email: "alex.dev@nextone.com",
      pass: "NextOne@2025",
      name: "Alex Rivera",
      roleText: "Individual Contributor & Task Execution",
      badge: "Contributor",
      color: "from-emerald-600 to-teal-600",
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
      setError("Please provide credentials to authenticate");
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
        setSeedNotice("Atlas cloud database synchronized with demo accounts, tasks, & queries!");
        handleSelectRole("admin");
      } else {
        setError(data.error || "Failed to initialize demo database");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? errMessage(e) : "Error connecting to cloud cluster";
      setError(msg);
    } finally {
      setSeeding(false);
    }
  };

  function errMessage(e: unknown) {
    return e instanceof Error ? e.message : "Error connecting to cluster";
  }

  return (
    <div className="min-h-screen bg-login-pattern flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* 60-30-10 Ambient Glow Backdrops (Subtle Blue & Electric Cyan) */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/15 via-indigo-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-cyan-400/10 to-transparent rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-slate-900 tracking-tight">NextOne</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Role-Based Internal Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MongoDB Atlas Connected</span>
          </div>

          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Seed sample data into MongoDB Atlas"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>{seeding ? "Syncing..." : "Seed Demo Accounts"}</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 z-10 w-full">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: High-Impact Showcase */}
          <div className="lg:col-span-7 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>NextOne Enterprise OS v2.5</span>
              <span className="text-slate-300">•</span>
              <span className="text-cyan-600 font-black">60-30-10 Design System</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Hierarchical Clarity. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Uncompromised Speed.
                </span>
              </h1>
              <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-lg">
                The centralized operational headquarters for NextOne. Bridging executive mandates from
                Admin, structured delegation by Managers, down to employee target delivery.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-2.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">3-Tier Hierarchy</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Admin assigns managers; managers lead assigned direct reports.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-2.5">
                  <GitFork className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Task Decomposition</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Managers split Admin tasks into sub-tasks with full audit logging.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2.5">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Daily Targets</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Daily commitments, progress notes, and managerial feedback threads.
                </p>
              </div>
            </div>

            {/* Live Security & Telemetry Bar */}
            <div className="flex items-center gap-6 pt-2 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Stateless Edge JWT Auth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-500" />
                <span>MongoDB Live Cluster</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-500" />
                <span>Non-blocking Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Advanced Light Glass Console Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-5">
              
              {/* Header */}
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Portal Sign In</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure access to your provisioned role console
                </p>
              </div>

              {/* Status alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <span>{error}</span>
                  <button
                    onClick={handleSeedDatabase}
                    className="underline text-indigo-600 hover:text-indigo-800 ml-2"
                  >
                    Reset DB
                  </button>
                </div>
              )}

              {seedNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{seedNotice}</span>
                </div>
              )}

              {/* 1-Click Persona Fast Track Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    1-Click Persona Fast Track
                  </label>
                  <span className="text-[10px] font-bold text-cyan-600">Auto-fills credentials</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["admin", "manager", "employee"] as const).map((roleKey) => {
                    const isSelected = selectedRole === roleKey;
                    const acc = demoAccounts[roleKey];
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleSelectRole(roleKey)}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/20"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="text-xs font-black capitalize tracking-tight">
                          {roleKey}
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

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 pt-1">
                {/* Email Field */}
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
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Encrypted Bcrypt</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
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
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 btn-action disabled:opacity-50 mt-2"
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

              {/* Account Provisioning Notice */}
              <div className="pt-2 text-center text-[11px] text-slate-400 leading-normal border-t border-slate-100">
                Accounts are provisioned by Admin. Self-registration is disabled per company policy.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-slate-200/80 bg-white/50 backdrop-blur-md text-center text-xs text-slate-500 z-10 flex flex-wrap items-center justify-between gap-2 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>NextOne Production Gateway • ISO-27001 Protocol</span>
        </div>
        <p>&copy; {new Date().getFullYear()} NextOne Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
