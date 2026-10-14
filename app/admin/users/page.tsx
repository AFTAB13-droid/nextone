"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { RoleBadge } from "@/components/ui/Badge";
import CreateUserModal from "@/components/users/CreateUserModal";
import AssignManagerModal from "@/components/users/AssignManagerModal";
import EditUserModal from "@/components/users/EditUserModal";
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
} from "lucide-react";
import { AuthSession, IUser } from "@/lib/types";
import Image from "next/image";

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEmployeeForAssign, setSelectedEmployeeForAssign] = useState<IUser | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<IUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update user status");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating account status");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const managers = users.filter((u) => u.role === "manager");
  const employees = users.filter((u) => u.role === "employee");

  return (
    <PortalShell
      user={currentUser}
      title="Team & Hierarchy Management"
      subtitle="Admin control center: Provision credentials, assign managers, and manage organizational hierarchy"
    >
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 sm:w-80 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterRole === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilterRole("manager")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterRole === "manager" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Managers ({managers.length})
            </button>
            <button
              onClick={() => setFilterRole("employee")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterRole === "employee" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Employees ({employees.length})
            </button>
          </div>
        </div>

        {/* Create User Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          Create User Account
        </button>
      </div>

      {/* Organizational Hierarchy Visualizer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-8">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Active Supervisory Hierarchy Tree
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Managers and their subordinate team members assigned by Admin
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managers.map((mgr) => {
            const team = employees.filter((e) => {
              const mid = typeof e.managerId === "object" && e.managerId ? e.managerId._id : e.managerId;
              return mid === mgr._id;
            });

            return (
              <div
                key={mgr._id}
                className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100 shadow-sm space-y-4"
              >
                {/* Manager Header */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-indigo-100 ring-2 ring-indigo-200 shrink-0">
                    <Image
                      src={
                        mgr.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          mgr.name
                        )}&background=4f46e5&color=fff`
                      }
                      alt={mgr.name}
                      width={44}
                      height={44}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{mgr.name}</p>
                      <RoleBadge role="manager" />
                    </div>
                    <p className="text-[11px] text-slate-500">{mgr.designation} • {mgr.department}</p>
                    <p className="text-[10px] text-indigo-600 font-mono mt-0.5">{mgr.email}</p>
                  </div>
                </div>

                {/* Subordinates List */}
                <div className="pt-3 border-t border-indigo-100/80">
                  <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-2">
                    Supervised Subordinates ({team.length})
                  </p>
                  {team.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No employees reporting to this manager.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {team.map((emp) => (
                        <div
                          key={emp._id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 shrink-0">
                              <Image
                                src={
                                  emp.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    emp.name
                                  )}&background=059669&color=fff`
                                }
                                alt={emp.name}
                                width={24}
                                height={24}
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{emp.designation}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedEmployeeForAssign(emp);
                              setIsAssignOpen(true);
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline px-2 py-1"
                          >
                            Reassign
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            All Company Accounts ({filteredUsers.length})
          </h3>
          <span className="text-xs text-slate-400">Created by Admin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Designation</th>
                <th className="px-6 py-3.5">Reports To (Manager)</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const managerObj =
                  typeof u.managerId === "object" && u.managerId ? (u.managerId as IUser) : null;
                const isUserActive = u.isActive !== false;

                return (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={
                              u.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                u.name
                              )}&background=6366f1&color=fff`
                            }
                            alt={u.name}
                            width={36}
                            height={36}
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 text-slate-700 font-medium">{u.department || "—"}</td>

                    {/* Designation */}
                    <td className="px-6 py-4 text-slate-700">{u.designation || "—"}</td>

                    {/* Reports To */}
                    <td className="px-6 py-4">
                      {u.role === "employee" ? (
                        managerObj ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{managerObj.name}</span>
                            <span className="text-[10px] text-slate-400">({managerObj.department})</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                            Unassigned
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 italic">Executive Lead</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-6 py-4">
                      {isUserActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === "employee" && (
                          <button
                            onClick={() => {
                              setSelectedEmployeeForAssign(u);
                              setIsAssignOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Assign Manager"
                          >
                            Assign
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedUserForEdit(u);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Account Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {u._id !== currentUser.userId && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isUserActive
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            }`}
                            title={isUserActive ? "Deactivate Account" : "Activate Account"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
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

      <EditUserModal
        user={selectedUserForEdit}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUserForEdit(null);
        }}
        onUserUpdated={() => fetchData()}
      />
    </PortalShell>
  );
}
