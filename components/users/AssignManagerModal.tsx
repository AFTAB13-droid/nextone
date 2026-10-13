"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { IUser } from "@/lib/types";
import { Users, AlertTriangle } from "lucide-react";

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
    const initialManager = typeof employee.managerId === "object" && employee.managerId ? employee.managerId._id : employee.managerId || "";
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Reporting Manager"
      description={`Update reporting supervisor for employee: ${employee.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
          <p className="font-bold text-slate-800">{employee.name}</p>
          <p className="text-slate-500">{employee.designation} • {employee.department}</p>
          <p className="text-[11px] text-slate-400 mt-1">{employee.email}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Manager in Charge
          </label>
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Unassigned (Direct to Admin) --</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} — {m.department} ({m.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            {loading ? "Saving..." : "Update Hierarchy"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignManagerModal;
