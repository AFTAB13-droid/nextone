"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RoleBadge } from "@/components/ui/Badge";
import CreateUserModal from "@/components/users/CreateUserModal";
import AssignManagerModal from "@/components/users/AssignManagerModal";
import EditUserModal from "@/components/users/EditUserModal";
import UserProfileDrawer from "@/components/users/UserProfileDrawer";
import { AssignEmployeesToManagerModal } from "@/components/users/AssignEmployeesToManagerModal";
import { getUserAvatar } from "@/lib/avatarHelper";
import StatCard from "@/components/ui/StatCard";
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  Search,
  UserCheck,
  ChevronRight,
  Mail,
  Phone,
  Building,
  Edit2,
  Power,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  GitBranch,
  User,
  Eye,
} from "lucide-react";
import { AuthSession, IUser } from "@/lib/types";
import Image from "next/image";

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEmployeeForAssign, setSelectedEmployeeForAssign] = useState<IUser | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<IUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<IUser | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [selectedManagerForTeamAssign, setSelectedManagerForTeamAssign] = useState<IUser | null>(null);
  const [isManagerTeamAssignOpen, setIsManagerTeamAssignOpen] = useState(false);

  const openManagerTeamAssign = (mgr: IUser) => {
    setSelectedManagerForTeamAssign(mgr);
    setIsManagerTeamAssignOpen(true);
  };

  const [loading, setLoading] = useState(true);

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

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner fullscreen message="Loading Organization & Hierarchy" subtext="Synchronizing company rosters and supervisory teams" />
      </div>
    );
  }

  const handleToggleStatus = async (user: IUser) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${user.name}'s account?`)) return;

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        fetchData();
        if (selectedUserForProfile && selectedUserForProfile._id === user._id) {
          setSelectedUserForProfile({ ...user, isActive: !user.isActive });
        }
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update user status");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating account status");
    }
  };

  const openUserProfile = (u: IUser) => {
    setSelectedUserForProfile(u);
    setIsProfileDrawerOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const managers = users.filter((u) => u.role === "manager");
  const employees = users.filter((u) => u.role === "employee");

  return (
    <PortalShell
      user={currentUser}
      title="Team & Organizational Governance"
      subtitle="Executive Oversight: Provision accounts, supervise hierarchical lines, and manage team access"
    >
      {/* Workforce KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Workforce"
          value={users.length}
          subtitle="Registered company accounts"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Supervising Managers"
          value={managers.length}
          subtitle="Team leadership heads"
          icon={Shield}
          color="purple"
        />
        <StatCard
          title="Associate Employees"
          value={employees.length}
          subtitle="Core execution workforce"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Active Accounts"
          value={users.filter((u) => u.isActive).length}
          subtitle={`${users.filter((u) => !u.isActive).length} suspended accounts`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Top Filter and Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, designation (e.g. Aarav, Engineering)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 sm:w-80 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterRole === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilterRole("manager")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterRole === "manager"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Managers ({managers.length})
            </button>
            <button
              onClick={() => setFilterRole("employee")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterRole === "employee"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Employees ({employees.length})
            </button>
          </div>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex items-center gap-3">
          {/* View Toggle: Table vs Cards */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards</span>
            </button>
          </div>

          {/* Create User Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 btn-action"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User Account</span>
          </button>
        </div>
      </div>

      {/* ================= ACTIVE SUPERVISORY HIERARCHY SECTION ================= */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-10 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Active Supervisory Hierarchy
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Interactive managerial hierarchy trees: Click any profile or avatar to inspect full employee logs
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80">
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            <span>{managers.length} Active Operational Nodes</span>
          </div>
        </div>

        {managers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No manager accounts registered yet. Create a Manager account to establish hierarchy lines.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {managers.map((mgr) => {
              const team = employees.filter((e) => {
                const mid = typeof e.managerId === "object" && e.managerId ? e.managerId._id : e.managerId;
                return mid === mgr._id;
              });

              return (
                <div
                  key={mgr._id}
                  className="rounded-3xl bg-gradient-to-b from-indigo-50/70 via-white to-white p-5 sm:p-6 border border-indigo-100/90 shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col justify-between"
                >
                  <div>
                    {/* Manager Header: Clickable to view profile */}
                    <div
                      onClick={() => openUserProfile(mgr)}
                      className="flex items-center gap-3.5 cursor-pointer p-2 rounded-2xl hover:bg-white/80 transition-all"
                    >
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white ring-2 ring-indigo-500/25 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                        <Image
                          src={getUserAvatar(mgr)}
                          alt={mgr.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-black text-slate-900 truncate hover:text-indigo-600">
                            {mgr.name}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 truncate">
                          {mgr.designation} • {mgr.department}
                        </p>
                        <p className="text-[10px] text-indigo-600 font-mono mt-0.5 truncate">{mgr.email}</p>
                      </div>
                    </div>

                    {/* Subordinates List */}
                    <div className="pt-4 mt-3 border-t border-indigo-100/90 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Direct Reports ({team.length})</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            {team.length} Active
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openManagerTeamAssign(mgr);
                            }}
                            className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 bg-indigo-100/80 hover:bg-indigo-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                            title="Assign unassigned employees to this manager"
                          >
                            <UserPlus className="w-3 h-3 text-indigo-600" />
                            <span>Assign</span>
                          </button>
                        </div>
                      </div>

                      {team.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-3 bg-white/60 rounded-xl px-3 border border-dashed border-indigo-200 text-center">
                          No associates assigned under this manager.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {team.map((emp) => (
                            <div
                              key={emp._id}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all"
                            >
                              <div
                                onClick={() => openUserProfile(emp)}
                                className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85"
                              >
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
                                  <p className="text-xs font-bold text-slate-800 truncate hover:text-indigo-600">
                                    {emp.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">{emp.designation}</p>
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

                  {/* Card bottom footer */}
                  <div className="pt-3 mt-4 border-t border-indigo-100/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Supervisor ID: #{mgr._id.slice(-6)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openManagerTeamAssign(mgr)}
                        className="font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                        title="Manage team members for this manager"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Assign Team</span>
                      </button>
                      <button
                        onClick={() => openUserProfile(mgr)}
                        className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <span>Full Profile</span>
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

      {/* ================= ALL USERS: TABLE VIEW OR CARDS VIEW ================= */}
      {viewMode === "table" ? (
        /* UPGRADED ENTERPRISE TABLE VIEW */
        <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          {/* Table Header Bar */}
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Enterprise Accounts Directory
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {filteredUsers.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Comprehensive directory with role classifications, reporting hierarchy, and full profile inspection
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200/70">
                {managers.length} Managers
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200/70">
                {employees.length} Employees
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/70">
                {users.filter((u) => u.isActive !== false).length} Active
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider text-[11px] font-black select-none">
                <tr>
                  <th className="px-6 sm:px-8 py-4.5 min-w-[300px]">User & Contact Identity</th>
                  <th className="px-6 py-4.5 min-w-[130px]">Role</th>
                  <th className="px-6 py-4.5 min-w-[170px]">Department</th>
                  <th className="px-6 py-4.5 min-w-[180px]">Designation</th>
                  <th className="px-6 py-4.5 min-w-[220px]">Supervisory Line</th>
                  <th className="px-6 py-4.5 min-w-[140px]">Account Status</th>
                  <th className="px-6 sm:px-8 py-4.5 text-right min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium">
                      No enterprise accounts found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const managerObj =
                      typeof u.managerId === "object" && u.managerId ? (u.managerId as IUser) : null;
                    const isUserActive = u.isActive !== false;

                    // Direct reports count if manager
                    const directReports =
                      u.role === "manager"
                        ? employees.filter((e) => {
                            const mid =
                              typeof e.managerId === "object" && e.managerId
                                ? e.managerId._id
                                : e.managerId;
                            return mid === u._id;
                          }).length
                        : 0;

                    return (
                      <tr
                        key={u._id}
                        className="hover:bg-indigo-50/40 transition-all duration-150 group cursor-pointer"
                        onClick={() => openUserProfile(u)}
                      >
                        {/* 1. User Identity Column */}
                        <td className="px-6 sm:px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-indigo-500/20 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                              <Image
                                src={getUserAvatar(u)}
                                alt={u.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base truncate">
                                  {u.name}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-slate-400 font-mono text-[11px] mt-1">
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{u.email}</span>
                                </div>
                                {u.phone && (
                                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{u.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role Column */}
                        <td className="px-6 py-5">
                          <RoleBadge role={u.role} />
                        </td>

                        {/* 3. Department Column */}
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs">
                            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{u.department || "Operations"}</span>
                          </span>
                        </td>

                        {/* 4. Designation Column */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[170px]">{u.designation || "Executive Associate"}</span>
                          </div>
                        </td>

                        {/* 5. Reporting Line / Supervisor Column */}
                        <td className="px-6 py-5">
                          {u.role === "employee" ? (
                            managerObj ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUserProfile(managerObj);
                                }}
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-900 font-bold hover:bg-indigo-100 hover:border-indigo-300 transition-all w-fit shadow-2xs"
                                title={`Reports to ${managerObj.name} (Click to inspect manager)`}
                              >
                                <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-200 shrink-0 ring-1 ring-indigo-400/30">
                                  <Image
                                    src={getUserAvatar(managerObj)}
                                    alt={managerObj.name}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs truncate max-w-[120px] block leading-tight">
                                    {managerObj.name}
                                  </span>
                                  <span className="text-[10px] text-indigo-500 font-semibold block leading-tight">
                                    Manager
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmployeeForAssign(u);
                                  setIsAssignOpen(true);
                                }}
                                className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                                title="No manager assigned yet"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                                <span>+ Assign Manager</span>
                              </button>
                            )
                          ) : u.role === "manager" ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openManagerTeamAssign(u);
                                }}
                                className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 shadow-2xs"
                                title="Manage employee assignments for this manager"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Assign Team ({directReports})</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono font-bold">
                              <Shield className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Executive Command</span>
                            </div>
                          )}
                        </td>

                        {/* 6. Account Status Column */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                              isUserActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs"
                                : "bg-rose-50 text-rose-800 border-rose-200 shadow-2xs"
                            }`}
                          >
                            <span className="relative flex h-2 w-2">
                              {isUserActive && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              )}
                              <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${
                                  isUserActive ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                            </span>
                            <span>{isUserActive ? "Active" : "Deactivated"}</span>
                          </span>
                        </td>

                        {/* 7. Actions Column */}
                        <td className="px-6 sm:px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Full Profile */}
                            <button
                              onClick={() => openUserProfile(u)}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              title="Inspect Full Profile Console"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Assign Employees (if manager) */}
                            {u.role === "manager" && (
                              <button
                                onClick={() => openManagerTeamAssign(u)}
                                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-xl transition-colors"
                                title="Manage Team Members"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reassign (if employee) */}
                            {u.role === "employee" && (
                              <button
                                onClick={() => {
                                  setSelectedEmployeeForAssign(u);
                                  setIsAssignOpen(true);
                                }}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                title="Reassign Reporting Manager"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit Profile */}
                            <button
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                setIsEditOpen(true);
                              }}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              title="Edit User Profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Toggle Account Status */}
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-2 rounded-xl transition-colors ${
                                isUserActive
                                  ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={isUserActive ? "Deactivate Account" : "Activate Account"}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Summary Bar */}
          <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{filteredUsers.length}</span>
              <span>of {users.length} total enterprise accounts displayed</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
              <span>NextOne Security Layer Active</span>
              <span>•</span>
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-3xl p-12 text-center text-slate-400 font-medium border border-slate-200">
              No accounts match the current filter.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const managerObj =
                typeof u.managerId === "object" && u.managerId ? (u.managerId as IUser) : null;
              const isUserActive = u.isActive !== false;

              return (
                <div
                  key={u._id}
                  onClick={() => openUserProfile(u)}
                  className="rounded-[30px] bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1.5 ${
                      u.role === "admin"
                        ? "bg-indigo-600"
                        : u.role === "manager"
                        ? "bg-cyan-500"
                        : "bg-emerald-500"
                    }`}
                  />

                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-indigo-500/20 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                        <Image
                          src={getUserAvatar(u)}
                          alt={u.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <RoleBadge role={u.role} />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isUserActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isUserActive ? "Active" : "Deactivated"}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {u.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {u.designation || "Associate"} • {u.department || "Operations"}
                    </p>

                    {/* Contact chips */}
                    <div className="mt-3.5 space-y-1 text-xs text-slate-500 font-mono">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Reporting line pill */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {u.role === "employee" ? (
                        managerObj ? (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Supervisor:</span>
                            <span className="font-bold text-slate-800">{managerObj.name}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-600 font-semibold">
                            ⚠️ No Manager Assigned
                          </div>
                        )
                      ) : u.role === "manager" ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-700">Team Manager</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openManagerTeamAssign(u);
                            }}
                            className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <UserPlus className="w-3 h-3 text-indigo-600" />
                            <span>Assign Employees</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-indigo-600 font-bold">
                          Executive Command
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div
                    className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openUserProfile(u)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Full Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Assign Employees button if manager */}
                      {u.role === "manager" && (
                        <button
                          onClick={() => openManagerTeamAssign(u)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          title="Assign Employees"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUserForEdit(u);
                          setIsEditOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg ${
                          isUserActive
                            ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={isUserActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals & Profile Drawer */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onUserCreated={() => fetchData()}
      />

      <AssignManagerModal
        employee={selectedEmployeeForAssign}
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssigned={() => fetchData()}
      />

      <AssignEmployeesToManagerModal
        manager={selectedManagerForTeamAssign}
        employees={employees}
        isOpen={isManagerTeamAssignOpen}
        onClose={() => setIsManagerTeamAssignOpen(false)}
        onAssigned={() => fetchData()}
      />

      <EditUserModal
        user={selectedUserForEdit}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUserUpdated={() => fetchData()}
      />

      <UserProfileDrawer
        user={selectedUserForProfile}
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        onEditUser={(u) => {
          setSelectedUserForEdit(u);
          setIsEditOpen(true);
        }}
        onToggleStatus={(u) => handleToggleStatus(u)}
        onAssignTeam={(mgr) => openManagerTeamAssign(mgr)}
      />
    </PortalShell>
  );
}
