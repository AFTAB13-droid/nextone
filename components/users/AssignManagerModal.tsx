"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { IUser } from "@/lib/types";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { getUserAvatar } from "@/lib/avatarHelper";
import { Users, AlertTriangle, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface AssignManagerModalProps {
  employee: IUser | null;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignManagerModal({
  employee,
  isOpen,
  onClose,
  onAssigned,
}: AssignManagerModalProps) {
  const [managerId, setManagerId] = useState<string>("");
  const [managers, setManagers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !employee) return;
    const initialManager =
      typeof employee.managerId === "object" && employee.managerId
        ? employee.managerId._id
        : employee.managerId || "";
    setManagerId(initialManager);

    const fetchManagers = async () => {
      try {
        const res = await fetch("/api/users?role=manager");
        if (res.ok) {
          const data = await res.json();
          setManagers(data.users || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchManagers();
  }, [isOpen, employee]);

  if (!employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users/assign-manager", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee._id,
          managerId: managerId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update hierarchy");
      }

      onAssigned();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error assigning manager";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const managerOptions: CustomSelectOption[] = [
    {
      value: "",
      label: "-- Direct to Executive Admin (No Manager) --",
      description: "Reports directly to company command",
    },
    ...managers.map((m) => ({
      value: m._id,
      label: m.name,
      badge: m.department || "Operations",
      description: `${m.designation || "Lead"} • ${m.email}`,
      icon: (
        <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200 shrink-0">
          <Image
            src={getUserAvatar(m)}
            alt={m.name}
            width={20}
            height={20}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ),
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Reporting Manager"
      description={`Update supervisory hierarchy for associate: ${employee.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 ring-2 ring-indigo-500/20 shrink-0">
            <Image
              src={getUserAvatar(employee)}
              alt={employee.name}
              width={44}
              height={44}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{employee.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {employee.designation} • {employee.department}
            </p>
            <p className="text-[11px] text-indigo-600 font-mono mt-0.5 truncate">{employee.email}</p>
          </div>
        </div>

        <div>
          <CustomSelect
            label="Designate Operations Manager"
            value={managerId}
            onChange={(val) => setManagerId(val)}
            options={managerOptions}
            searchable
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50 btn-action"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? "Reassigning..." : "Update Hierarchy"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignManagerModal;
