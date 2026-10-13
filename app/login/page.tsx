"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
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
        throw new Error(data.error || "Login failed");
      }

      // Redirect based on role
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

  const fillDemo = (roleEmail: string, rolePass: string = "NextOne@2025") => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedNotice(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedNotice("Demo users and sample tasks created successfully!");
        fillDemo("admin@nextone.com");
      } else {
        setError(data.error || "Failed to seed database");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error initializing demo data";
      setError(msg);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/25 mb-4 ring-4 ring-indigo-500/20">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            NextOne Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Role-Based Enterprise Work & Hierarchy Hub
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="underline text-indigo-400 hover:text-indigo-300 ml-2"
              >
                {seeding ? "Seeding..." : "Seed Demo Users"}
              </button>
            </div>
          )}

          {seedNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{seedNotice}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@nextone.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Quick Demo Role Login
              </span>
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                {seeding ? "Initializing..." : "Reset / Seed DB"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin@nextone.com")}
                className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/50 hover:bg-purple-900/50 text-left transition-all group"
              >
                <p className="text-[11px] font-bold text-purple-300">Admin</p>
                <p className="text-[9px] text-purple-400/80">Executive</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("sarah.lead@nextone.com")}
                className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/50 hover:bg-blue-900/50 text-left transition-all group"
              >
                <p className="text-[11px] font-bold text-blue-300">Manager</p>
                <p className="text-[9px] text-blue-400/80">Tech Lead</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("alex.dev@nextone.com")}
                className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 text-left transition-all group"
              >
                <p className="text-[11px] font-bold text-emerald-300">Employee</p>
                <p className="text-[9px] text-emerald-400/80">Developer</p>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
              Password: NextOne@2025
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mt-6">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Role-Based Access Control • JWT Guard Active</span>
        </div>
      </div>
    </div>
  );
}
