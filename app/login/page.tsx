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
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      name: "NextOne Executive Admin",
      roleText: "Top-Level Operations Oversight",
      badge: "Executive Console",
    },
    manager: {
      email: "sarah.lead@nextone.com",
      pass: "NextOne@2025",
      name: "Sarah Jenkins (Tech Lead)",
      roleText: "Team Delegation & Delivery Lead",
      badge: "Team Management",
    },
    employee: {
      email: "alex.dev@nextone.com",
      pass: "NextOne@2025",
      name: "Alex Rivera (Frontend Dev)",
      roleText: "Individual Contributor & Task Execution",
      badge: "Worker Workspace",
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

      // Route redirect
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Futuristic Top Bar */}
      <header className="w-full px-6 py-5 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white tracking-wider">NextOne</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO PORTAL
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Atlas MongoDB Online</span>
          </div>

          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{seeding ? "Syncing..." : "Seed / Reset Cloud DB"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Feature Column: High-tech console presentation */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Hierarchical Operations Engine</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Workplace Command <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                Without Limits.
              </span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A bespoke role-based ecosystem crafted for NextOne. Seamlessly synchronizing executive
              mandates, team task lifecycles, and bottom-up query resolutions.
            </p>

            {/* Feature Telemetry Cards */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Full Lifecycle State Machine</h4>
                  <p className="text-[11px] text-slate-400">
                    Pending → In Progress → Review Submission → Approval Audit.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dual-Tier Escalation Desk</h4>
                  <p className="text-[11px] text-slate-400">
                    Employees query managers; managers escalate directly to executive admin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Authentication Form: Advanced Glassmorphic Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6">
              {/* Form Title */}
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Access Portal</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Authenticate with your role-provisioned credentials
                </p>
              </div>

              {/* Status alerts */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <span>{error}</span>
                  <button
                    onClick={handleSeedDatabase}
                    className="underline text-indigo-400 hover:text-indigo-300 ml-2"
                  >
                    Reset DB
                  </button>
                </div>
              )}

              {seedNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{seedNotice}</span>
                </div>
              )}

              {/* Interactive Role Switcher Pills */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Select Role Persona (1-Click Fast Track)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectRole("admin")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === "admin"
                        ? "bg-purple-950/70 border-purple-500 text-white shadow-lg shadow-purple-900/30 ring-1 ring-purple-500"
                        : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    <p className="text-xs font-black text-purple-300">Admin</p>
                    <p className="text-[10px] text-slate-400 truncate">Executive</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRole("manager")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === "manager"
                        ? "bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-500"
                        : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    <p className="text-xs font-black text-indigo-300">Manager</p>
                    <p className="text-[10px] text-slate-400 truncate">Team Lead</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRole("employee")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === "employee"
                        ? "bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-500"
                        : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    <p className="text-xs font-black text-emerald-300">Employee</p>
                    <p className="text-[10px] text-slate-400 truncate">Developer</p>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@nextone.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    {/* Show/Hide Eye Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 tracking-wider uppercase mt-2"
                >
                  {loading ? "Authenticating..." : "Enter Workspace Console"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom security guarantee */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bit JWT Encrypted</span>
                </span>
                <span className="font-mono text-[10px]">NextOne Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-slate-500 border-t border-white/[0.04]">
        NextOne Corporation • Role-Based Operations Portal • Connected to Live MongoDB Atlas Cluster
      </footer>
    </div>
  );
}
