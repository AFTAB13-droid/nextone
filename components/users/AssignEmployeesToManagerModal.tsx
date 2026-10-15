"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { IUser } from "@/lib/types";
import { getUserAvatar } from "@/lib/avatarHelper";
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  AlertTriangle,
  ArrowRight,
  Filter,
  ArrowLeftRight,
} from "lucide-react";

interface AssignEmployeesToManagerModalProps {
  manager: IUser | null;
  employees: IUser[];
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignEmployeesToManagerModal({
  manager,
  employees,
  isOpen,
  onClose,
  onAssigned,
}: AssignEmployeesToManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"unassigned" | "current" | "all">("unassigned");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showReassignWarning, setShowReassignWarning] = useState(false);

  // Categorize employees relative to this manager
  const { unassignedEmployees, currentTeamEmployees, otherEmployees } = useMemo(() => {
    if (!manager) {
      return { unassignedEmployees: [], currentTeamEmployees: [], otherEmployees: [] };
    }

    const unassigned: IUser[] = [];
    const currentTeam: IUser[] = [];
    const others: IUser[] = [];

    employees.forEach((emp) => {
      const mid =
        typeof emp.managerId === "object" && emp.managerId ? emp.managerId._id : emp.managerId;

      if (!mid) {
        unassigned.push(emp);
      } else if (mid === manager._id) {
        currentTeam.push(emp);
      } else {
        others.push(emp);
      }
    });

    return {
      unassignedEmployees: unassigned,
      currentTeamEmployees: currentTeam,
      otherEmployees: others,
    };
  }, [employees, manager]);

  // Determine list for current tab: ALL tab MUST show ALL system employees!
  const tabList = useMemo(() => {
    let list: IUser[] = [];
    if (activeTab === "unassigned") list = unassignedEmployees;
    else if (activeTab === "current") list = currentTeamEmployees;
    else list = employees; // Complete system employee directory

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q))
    );
  }, [activeTab, unassignedEmployees, currentTeamEmployees, employees, searchQuery]);

  // Identify if any of the selected employees are currently under other managers
  const selectedReassignments = useMemo(() => {
    if (!manager) return [];
    return employees.filter((e) => {
      if (!selectedEmpIds.includes(e._id)) return false;
      const mid =
        typeof e.managerId === "object" && e.managerId ? e.managerId._id : e.managerId;
      return mid && mid !== manager._id;
    });
  }, [employees, manager, selectedEmpIds]);

  // Toggle selection
  const handleToggleSelect = (empId: string) => {
    // If employee is already in this manager's team, they cannot be selected for assignment
    if (currentTeamEmployees.some((curr) => curr._id === empId)) return;

    setSelectedEmpIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSelectAllInTab = () => {
    // Only select employees who are NOT currently in this manager's team
    const selectable = tabList
      .filter((e) => !currentTeamEmployees.some((curr) => curr._id === e._id))
      .map((e) => e._id);

    if (selectable.length === 0) return;

    const allSelected = selectable.every((id) => selectedEmpIds.includes(id));
    if (allSelected) {
      setSelectedEmpIds((prev) => prev.filter((id) => !selectable.includes(id)));
    } else {
      setSelectedEmpIds((prev) => Array.from(new Set([...prev, ...selectable])));
    }
  };

  // Trigger assignment: Check if warning is required
  const handleAssignClick = () => {
    if (selectedEmpIds.length === 0) return;

    // If any selected employee belongs to another manager, trigger warning dialog
    if (selectedReassignments.length > 0) {
      setShowReassignWarning(true);
      return;
    }

    // Otherwise, assign directly
    executeAssignment();
  };

  // Submit batch assignment to server
  const executeAssignment = async () => {
    if (!manager || selectedEmpIds.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setShowReassignWarning(false);

    try {
      const res = await fetch("/api/users/assign-manager", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerId: manager._id,
          employeeIds: selectedEmpIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to assign employees");
      }

      setSuccessMsg(
        `Successfully assigned ${selectedEmpIds.length} employee(s) to ${manager.name}!`
      );
      setSelectedEmpIds([]);
      onAssigned();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error assigning employees";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Unassign single employee from this manager
  const handleUnassignEmployee = async (emp: IUser) => {
    if (!confirm(`Are you sure you want to remove ${emp.name} from ${manager?.name}'s team?`)) {
      return;
    }

    setUnassigningId(emp._id);
    setError(null);

    try {
      const res = await fetch("/api/users/assign-manager", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: emp._id,
          managerId: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove employee");
      }

      onAssigned();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error removing employee";
      setError(msg);
    } finally {
      setUnassigningId(null);
    }
  };

  if (!manager) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Team Members to ${manager.name}`}
      description="Supervisory Assignment: Select employees to assign under this manager. Each employee can report to only one manager."
      maxWidth="xl"
    >
      <div className="space-y-6 relative">
        {/* Manager Summary Hero Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-cyan-50/50 to-slate-50 border border-indigo-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white ring-2 ring-indigo-500/25 shadow-sm shrink-0">
              <Image
                src={getUserAvatar(manager)}
                alt={manager.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 truncate">{manager.name}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  Manager
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {manager.designation || "Operations Manager"} • {manager.department || "Operations"}
              </p>
              <p className="text-[10px] text-indigo-600 font-mono truncate">{manager.email}</p>
            </div>
          </div>

          <div className="text-right shrink-0 bg-white/80 px-4 py-2 rounded-xl border border-indigo-100/80 shadow-2xs">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Team</div>
            <div className="text-lg font-black text-indigo-700">
              {currentTeamEmployees.length}{" "}
              <span className="text-xs font-medium text-slate-500">Associates</span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("unassigned")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "unassigned"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available Unassigned</span>
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                {unassignedEmployees.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("current")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "current"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Current Team</span>
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black">
                {currentTeamEmployees.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>All Employees</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-black">
                {employees.length}
              </span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Filter by name, designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Tab Controls: Select All button (only for assignable tabs) */}
        {activeTab !== "current" && tabList.length > 0 && (
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>
              Showing {tabList.length} employee{tabList.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={handleSelectAllInTab}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Select All Assignable
            </button>
          </div>
        )}

        {/* Employees List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 rounded-2xl border border-slate-200/80 p-2 bg-slate-50/50">
          {tabList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {activeTab === "unassigned" ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-600">No unassigned employees available</p>
                  <p className="text-[11px]">All registered employees are currently assigned to managers.</p>
                </div>
              ) : activeTab === "current" ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-600">No employees currently in this team</p>
                  <p className="text-[11px]">Select unassigned or other employees to build this manager's team.</p>
                </div>
              ) : (
                <p>No employees match your search query.</p>
              )}
            </div>
          ) : (
            tabList.map((emp) => {
              const isSelected = selectedEmpIds.includes(emp._id);
              const isCurrentlyInTeam = currentTeamEmployees.some((e) => e._id === emp._id);
              const managerObj =
                typeof emp.managerId === "object" && emp.managerId ? (emp.managerId as IUser) : null;

              // In "All Employees" tab or "Available" tab:
              // Employees already in this team cannot be selected (no checkbox)
              const isSelectable = activeTab !== "current" && !isCurrentlyInTeam;

              return (
                <div
                  key={emp._id}
                  onClick={() => {
                    if (isSelectable) {
                      handleToggleSelect(emp._id);
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrentlyInTeam
                      ? "bg-slate-50/80 border-slate-200/60 opacity-95"
                      : isSelectable
                      ? isSelected
                        ? "bg-indigo-50/90 border-indigo-300 shadow-sm cursor-pointer"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox for selectable employees */}
                    {isSelectable ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(emp._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 shrink-0 cursor-pointer"
                      />
                    ) : isCurrentlyInTeam ? (
                      /* If in current team, show a subtle check icon instead of a checkbox */
                      <div
                        className="w-4 h-4 flex items-center justify-center shrink-0"
                        title="Already member of this team"
                      >
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      </div>
                    ) : null}

                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                      <Image
                        src={getUserAvatar(emp)}
                        alt={emp.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {emp.name}
                        </span>

                        {isCurrentlyInTeam ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                            <span>In This Manager's Team</span>
                          </span>
                        ) : !emp.managerId ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                            Available / Unassigned
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                            Reports to: {managerObj ? managerObj.name : "Another Manager"}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 truncate">
                        {emp.designation || "Associate Specialist"} • {emp.department || "Operations"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{emp.email}</p>
                    </div>
                  </div>

                  {/* Right side actions for Current Team Tab */}
                  {activeTab === "current" && (
                    <button
                      type="button"
                      disabled={unassigningId === emp._id}
                      onClick={() => handleUnassignEmployee(emp)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {unassigningId === emp._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserX className="w-3.5 h-3.5" />
                      )}
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            {selectedEmpIds.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-700">
                  {selectedEmpIds.length} employee{selectedEmpIds.length === 1 ? "" : "s"} selected
                </span>
                {selectedReassignments.length > 0 && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>{selectedReassignments.length} requires manager transfer</span>
                  </span>
                )}
              </div>
            ) : (
              <span>Select employees above to assign or reassign to this manager.</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading || selectedEmpIds.length === 0}
              onClick={handleAssignClick}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>Assign to {manager.name} ({selectedEmpIds.length})</span>
            </button>
          </div>
        </div>

        {/* ================= REASSIGNMENT WARNING CONFIRMATION MODAL OVERLAY ================= */}
        {showReassignWarning && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs rounded-[28px] sm:rounded-[36px] flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-amber-200 shadow-2xl space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                  <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    Confirm Manager Transfer
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The following <span className="font-bold text-amber-700">{selectedReassignments.length} employee(s)</span> are currently assigned to another manager. Confirming will <span className="font-bold text-rose-600">remove them</span> from their current manager's team and transfer them into <span className="font-bold text-indigo-700">{manager.name}'s</span> team:
                  </p>
                </div>
              </div>

              {/* List of affected reassignments */}
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3">
                {selectedReassignments.map((emp) => {
                  const currentMgr =
                    typeof emp.managerId === "object" && emp.managerId
                      ? (emp.managerId as IUser)
                      : null;

                  return (
                    <div
                      key={emp._id}
                      className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                          <Image
                            src={getUserAvatar(emp)}
                            alt={emp.name}
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 truncate">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{emp.designation}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-bold shrink-0">
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {currentMgr ? currentMgr.name : "Previous Manager"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {manager.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Note: Per company policy, each employee can only be assigned under one manager at any time.
              </p>

              {/* Warning Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReassignWarning(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all"
                >
                  Cancel / Go Back
                </button>
                <button
                  type="button"
                  onClick={executeAssignment}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md shadow-amber-600/25 transition-all flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Confirm Transfer & Assign ({selectedEmpIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
