"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Target,
  HelpCircle,
  Bell,
  User,
  ArrowRight,
  Lock,
  Building,
  Award,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import { AuthSession, IUser } from "@/lib/types";

interface FirstLoginWelcomeModalProps {
  user: AuthSession;
  onCompleted?: () => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function FirstLoginWelcomeModal({
  user,
  onCompleted,
  forceOpen = false,
  onClose,
}: FirstLoginWelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [fullUserDetails, setFullUserDetails] = useState<IUser | null>(null);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTelemetry, setAgreeTelemetry] = useState(false);
  const [agreeSecurity, setAgreeSecurity] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      launchCelebrationConfetti();
      playCelebrationChime();
    }
  }, [forceOpen]);

  // Play synthesized celebratory chime using Web Audio API
  const playCelebrationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Major celebratory arpeggio)
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + index * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.65);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Trigger high-class multi-blast canvas confetti
  const launchCelebrationConfetti = () => {
    try {
      // Center fireworks burst
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6"],
      });

      // Left cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.7 },
          colors: ["#4f46e5", "#06b6d4", "#10b981", "#fbbf24"],
        });
      }, 250);

      // Right cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.7 },
          colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981"],
        });
      }, 450);
    } catch {
      // Ignore if canvas not supported
    }
  };

  // Check if current user needs first login modal
  useEffect(() => {
    const checkFirstLoginStatus = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setFullUserDetails(data.user);
            // If user has not completed first login, open the modal
            if (data.user.firstLoginCompleted === false) {
              setIsOpen(true);
            }
          }
        }
      } catch {
        // Fallback to prop
        if (user.firstLoginCompleted === false) {
          setIsOpen(true);
        }
      }
    };

    checkFirstLoginStatus();
  }, [user]);

  // When modal opens, blast celebratory confetti and chime
  useEffect(() => {
    if (isOpen && !hasCelebrated) {
      setHasCelebrated(true);
      launchCelebrationConfetti();
      playCelebrationChime();
    }
  }, [isOpen, hasCelebrated]);

  const allAccepted = agreePrivacy && agreeTelemetry && agreeSecurity;

  const handleSelectAll = () => {
    const nextState = !allAccepted;
    setAgreePrivacy(nextState);
    setAgreeTelemetry(nextState);
    setAgreeSecurity(nextState);
  };

  const handleCompleteOnboarding = async () => {
    if (!allAccepted || submitting) return;
    setSubmitting(true);

    try {
      // Fire celebration blast
      launchCelebrationConfetti();
      playCelebrationChime();

      const res = await fetch("/api/users/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to record onboarding completion");
      }

      setIsOpen(false);
      if (onCompleted) {
        onCompleted();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error completing onboarding";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayUser = fullUserDetails || user;
  const managerObj = typeof displayUser.managerId === "object" && displayUser.managerId !== null
    ? (displayUser.managerId as IUser)
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-4xl my-auto bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
        
        {/* Celebration Header Gradient Banner */}
        <div className="relative bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 px-6 sm:px-10 py-7 text-white overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onClose();
                }}
                className="absolute top-0 right-0 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-2.5 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                <span>Induction & Welcome Protocol</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                Welcome to NextOne, {displayUser.name}!
              </h2>
              <p className="text-indigo-100 text-sm mt-1 max-w-xl">
                We are thrilled to welcome you to our high-performance community workplace portal. Please review your induction notes and accept workplace policies to activate your workspace.
              </p>
            </div>

            {/* Role & Status Pill */}
            <div className="flex-shrink-0 self-start sm:self-center bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <span className="text-[11px] uppercase tracking-wider text-indigo-200 block font-medium">Assigned Role</span>
              <span className="text-lg font-bold text-white capitalize flex items-center justify-center gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-amber-300" />
                {displayUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-6 text-slate-700 custom-scrollbar">
          
          {/* Section 1: User Profile & Manager Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 truncate">{displayUser.name}</h4>
                <p className="text-xs text-slate-500 truncate">{displayUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    <Building className="w-3 h-3" />
                    {displayUser.department || "General"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {displayUser.designation || "Team Member"}
                  </span>
                </div>
              </div>
            </div>

            {/* Reporting Manager Context */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Reporting Hierarchy
                </span>
                {managerObj ? (
                  <>
                    <h4 className="font-bold text-slate-900 truncate">{managerObj.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{managerObj.designation || "Assigned Manager"} • {managerObj.email}</p>
                  </>
                ) : (
                  <>
                    <h4 className="font-semibold text-slate-800">
                      {displayUser.role === "manager" ? "Direct Leadership / Admin" : displayUser.role === "admin" ? "System Super Admin" : "NextOne Operations"}
                    </h4>
                    <p className="text-xs text-slate-500">Directly coordinated through Management</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Executive Welcome Note */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/70 relative">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Executive Welcome from NextOne Leadership
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  &ldquo;Welcome to our enterprise ecosystem! NextOne is designed to empower every employee and team lead with real-time operational transparency, high-velocity collaboration, and frictionless task execution. You are equipped with cutting-edge tools to track targets, resolve bottlenecks instantly, and thrive in an agile environment. We are excited to build remarkable outcomes together.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Essential Operational Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Essential System Guidelines & Instructions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-white">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900">Zero-Click Screen & Focus Telemetry</h5>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Your work presence and active screen focus hours are monitored intelligently in real-time. No manual daily punch-in or punch-out is required.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-white">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Target className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900">Task Lifecycle & Daily Targets</h5>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Keep tasks updated across stages (Pending, In Progress, Review, Completed) and register daily targets for transparent team synchrony.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-white">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900">Fast-Track Query Resolution</h5>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Face any technical blocker or clarification? Raise a ticket via the Queries portal for prompt manager responses and instant escalation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-white">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900">Real-Time Push & Desktop PWA</h5>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Enable browser push notifications or click &apos;Install App (PWA)&apos; from the sidebar to receive instant task alerts even when tabs are closed.
                </p>
              </div>

            </div>
          </div>

          {/* Section 4: Mandatory Compliance & Privacy Policy Checkboxes */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Mandatory Compliance & Privacy Policy Consent
                </h4>
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {allAccepted ? "Deselect All" : "Select All Agreements"}
              </button>
            </div>

            <div className="space-y-3 pt-1">
              
              {/* Checkbox 1: Privacy Policy */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                  <strong className="text-slate-800 font-semibold">Privacy Policy & Code of Conduct:</strong> I have reviewed and agree to NextOne&apos;s data privacy principles, organizational ethics, and confidential information protocols.
                </span>
              </label>

              {/* Checkbox 2: Telemetry */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeTelemetry}
                  onChange={(e) => setAgreeTelemetry(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                  <strong className="text-slate-800 font-semibold">Ambient Telemetry Consent:</strong> I acknowledge and authorize the portal to log ambient active focus duration, system presence, and task completion metrics during workspace activity.
                </span>
              </label>

              {/* Checkbox 3: Security & Credentials */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeSecurity}
                  onChange={(e) => setAgreeSecurity(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                  <strong className="text-slate-800 font-semibold">Account & Information Security:</strong> I agree to keep my authentication credentials secure, refrain from sharing access tokens, and report any suspicious workspace anomalies.
                </span>
              </label>

            </div>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 sm:px-10 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {allAccepted ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                All compliance agreements checked. Ready to enter!
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Please accept all 3 checkboxes above to unlock your workspace.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!allAccepted || submitting}
            onClick={handleCompleteOnboarding}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              allAccepted && !submitting
                ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-300 hover:scale-[1.02] cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Activating Workspace...</span>
              </>
            ) : allAccepted ? (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Check Policies to Enter</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
