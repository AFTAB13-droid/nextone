"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import StatCard from "@/components/ui/StatCard";
import CreateUserModal from "@/components/users/CreateUserModal";
import AssignManagerModal from "@/components/users/AssignManagerModal";
import UserProfileDrawer from "@/components/users/UserProfileDrawer";
import { AssignEmployeesToManagerModal } from "@/components/users/AssignEmployeesToManagerModal";
import { getUserAvatar } from "@/lib/avatarHelper";
import {
  Users,
  GitBranch,
  Shield,
  Briefcase,
  Search,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { AuthSession, IUser } from "@/lib/types";
import Image from "next/image";

export default function AdminTeamsPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEmployeeForAssign, setSelectedEmployeeForAssign] = useState<IUser | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<IUser | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [selectedManagerForTeamAssign, setSelectedManagerForTeamAssign] = useState<IUser | null>(null);
  const [isManagerTeamAssignOpen, setIsManagerTeamAssignOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users"),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const managers = useMemo(() => users.filter((u) => u.role === "manager"), [users]);
  const employees = useMemo(() => users.filter((u) => u.role === "employee"), [users]);

  // Subordinates helper
  const getSubordinates = (managerId: string) => {
    return employees.filter((e) => {
      const mid = typeof e.managerId === "object" && e.managerId ? e.managerId._id : e.managerId;
      return mid === managerId;
    });
  };

  // Unassigned employees
  const unassignedEmployees = useMemo(() => {
    return employees.filter((e) => !e.managerId);
  }, [employees]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    managers.forEach((m) => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set);
  }, [managers]);

  // Filtered managers
  const filteredManagers = useMemo(() => {
    return managers.filter((m) => {
      const matchesDept = selectedDepartment === "all" || m.department === selectedDepartment;
      const team = getSubordinates(m._id);
      const teamMatch = team.some(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.designation?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teamMatch;
      return matchesDept && matchesSearch;
    });
  }, [managers, selectedDepartment, searchQuery, employees]);

  const assignedCount = employees.length - unassignedEmployees.length;
  const avgTeamSize = managers.length > 0 ? (assignedCount / managers.length).toFixed(1) : "0";

  const openManagerTeamAssign = (mgr: IUser) => {
    setSelectedManagerForTeamAssign(mgr);
    setIsManagerTeamAssignOpen(true);
  };

  const openUserProfile = (user: IUser) => {
    setSelectedUserForProfile(user);
    setIsProfileDrawerOpen(true);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner
          fullscreen
          message="Loading Organization Hierarchy"
          subtext="Synchronizing company branches and supervisory lines"
        />
      </div>
    );
  }

  return (
    <PortalShell
      user={currentUser}
      title="Teams & Organization Hierarchy"
      subtitle="Complete managerial hierarchy, supervisory branches, and direct report allocations"
    >
      <div className="space-y-8">
        
        {/* Navigation Breadcrumb / Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to User Directory</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-500">Supervisory Hierarchy</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Team Manager</span>
            </button>
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Operational Teams"
            value={managers.length}
            subtitle="Supervisory branches"
            icon={GitBranch}
            color="indigo"
          />
          <StatCard
            title="Assigned Associates"
            value={assignedCount}
            subtitle="Under active supervision"
            icon={Briefcase}
            color="emerald"
          />
          <StatCard
            title="Unassigned Staff"
            value={unassignedEmployees.length}
            subtitle={unassignedEmployees.length > 0 ? "Requires manager assignment" : "All staff assigned"}
            icon={Users}
            color={unassignedEmployees.length > 0 ? "amber" : "blue"}
            badge={unassignedEmployees.length > 0 ? "Action Required" : "Optimal"}
          />
          <StatCard
            title="Average Team Size"
            value={`${avgTeamSize} Staff`}
            subtitle="Staff per manager node"
            icon={Shield}
            color="purple"
          />
        </div>

        {/* Unassigned Associates Alert Tray (if any exist) */}
        {unassignedEmployees.length > 0 && (
          <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-900">
                    {unassignedEmployees.length} Associates Need Manager Assignment
                  </h4>
                  <p className="text-xs text-amber-700">
                    Unassigned staff will not have direct supervision or daily target approvals.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {unassignedEmployees.map((emp) => (
                <div
                  key={emp._id}
                  className="flex items-center justify-between p-3 bg-white rounded-2xl border border-amber-200/90 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                      <Image
                        src={getUserAvatar(emp)}
                        alt={emp.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{emp.designation || "Associate"}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedEmployeeForAssign(emp);
                      setIsAssignOpen(true);
                    }}
                    className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors shrink-0"
                  >
                    Assign Manager
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar: Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search managers, direct reports, departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 sm:w-80 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>

            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              >
                <option value="all">All Departments ({managers.length})</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredManagers.length}</span> of {managers.length} managerial teams
          </div>
        </div>

        {/* Full Grid of Manager Hierarchy Cards */}
        {filteredManagers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-bold text-slate-700 text-sm">No managerial teams match this filter</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the department filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManagers.map((mgr) => {
              const team = getSubordinates(mgr._id);

              return (
                <div
                  key={mgr._id}
                  className="rounded-3xl bg-white p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
                >
                  <div>
                    {/* Manager Profile Header */}
                    <div
                      onClick={() => openUserProfile(mgr)}
                      className="flex items-start gap-3.5 cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-all -m-2 mb-3"
                    >
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-indigo-500/20 shadow-sm shrink-0">
                        <Image
                          src={getUserAvatar(mgr)}
                          alt={mgr.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-extrabold text-slate-900 truncate hover:text-indigo-600">
                            {mgr.name}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                          {mgr.designation || "Manager"}
                        </p>
                        <p className="text-[11px] text-indigo-600 font-mono truncate">{mgr.department || "Operations"}</p>
                      </div>
                    </div>

                    {/* Contact Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pb-3 border-b border-slate-100">
                      <span className="flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{mgr.email}</span>
                      </span>
                      {mgr.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{mgr.phone}</span>
                        </span>
                      )}
                    </div>

                    {/* Subordinates Section */}
                    <div className="pt-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Direct Reports ({team.length})</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {team.length} Active
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openManagerTeamAssign(mgr);
                            }}
                            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100/80 hover:bg-indigo-200 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1"
                            title="Assign or reassign associates to this manager"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        </div>
                      </div>

                      {team.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 bg-slate-50 rounded-2xl px-3 border border-dashed border-slate-200 text-center">
                          No direct reports assigned under this manager yet.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {team.map((emp) => (
                            <div
                              key={emp._id}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:bg-white hover:border-indigo-300 transition-all"
                            >
                              <div
                                onClick={() => openUserProfile(emp)}
                                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg overflow-hidden bg-white ring-1 ring-slate-200 shrink-0">
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
                                  <p className="text-xs font-bold text-slate-800 truncate hover:text-indigo-600">
                                    {emp.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">{emp.designation || "Associate"}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedEmployeeForAssign(emp);
                                  setIsAssignOpen(true);
                                }}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors shrink-0"
                              >
                                Reassign
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Supervisor: #{mgr._id.slice(-6)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openManagerTeamAssign(mgr)}
                        className="font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Manage Team</span>
                      </button>
                      <button
                        onClick={() => openUserProfile(mgr)}
                        className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={() => fetchData()}
      />

      <AssignManagerModal
        isOpen={isAssignOpen}
        employee={selectedEmployeeForAssign}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedEmployeeForAssign(null);
        }}
        onAssigned={() => fetchData()}
      />

      <AssignEmployeesToManagerModal
        isOpen={isManagerTeamAssignOpen}
        manager={selectedManagerForTeamAssign}
        employees={employees}
        onClose={() => {
          setIsManagerTeamAssignOpen(false);
          setSelectedManagerForTeamAssign(null);
        }}
        onAssigned={() => fetchData()}
      />

      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => {
          setIsProfileDrawerOpen(false);
          setSelectedUserForProfile(null);
        }}
        user={selectedUserForProfile}
      />
    </PortalShell>
  );
}
