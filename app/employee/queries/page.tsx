"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import QueryCard from "@/components/queries/QueryCard";
import QueryModal from "@/components/queries/QueryModal";
import CreateQueryModal from "@/components/queries/CreateQueryModal";
import { HelpCircle, Search, Plus, MessageSquare } from "lucide-react";
import { AuthSession, IQuery } from "@/lib/types";

export default function EmployeeQueriesPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedQuery, setSelectedQuery] = useState<IQuery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meRes, queriesRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/queries"),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        setCurrentUser(d.user);
      }
      if (queriesRes.ok) {
        const d = await queriesRes.json();
        setQueries(d.queries || []);
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
        <LoadingSpinner fullscreen message="Loading Queries & Support" subtext="Fetching question thread history, escalations, and manager answers" />
      </div>
    );
  }

  const filteredQueries = queries.filter((q) => {
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <PortalShell
      user={currentUser}
      title="Ask Manager & Query Desk"
      subtitle="Direct line to your reporting manager: Ask questions, report technical blockers, and track resolutions"
    >
      {/* Top Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search my queries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 sm:w-72 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
          >
            <option value="all">All Statuses ({queries.length})</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Raise New Query
        </button>
      </div>

      {/* Grid */}
      {filteredQueries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">No queries raised yet</h4>
          <p className="text-xs text-slate-500">
            Have a question or blocked on a task? Click &quot;Raise New Query&quot; above to message your manager.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQueries.map((q) => (
            <QueryCard
              key={q._id}
              query={q}
              onClick={(query) => {
                setSelectedQuery(query);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <QueryModal
        query={selectedQuery}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onQueryUpdated={(updated) => {
          setQueries((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
          setSelectedQuery(updated);
          fetchData();
        }}
      />

      <CreateQueryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUser={currentUser}
        onQueryCreated={() => fetchData()}
      />
    </PortalShell>
  );
}
