"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import QueryCard from "@/components/queries/QueryCard";
import QueryModal from "@/components/queries/QueryModal";
import { HelpCircle, Search, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { AuthSession, IQuery } from "@/lib/types";

export default function AdminQueriesPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [onlyEscalated, setOnlyEscalated] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedQuery, setSelectedQuery] = useState<IQuery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredQueries = queries.filter((q) => {
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const matchesEscalated = !onlyEscalated || Boolean(q.escalatedTo);
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      q.raisedBy?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesEscalated && matchesSearch;
  });

  const escalatedCount = queries.filter((q) => q.escalatedTo && q.status !== "resolved").length;

  return (
    <PortalShell
      user={currentUser}
      title="Query Resolution & Help Desk"
      subtitle="Executive triage: Resolve employee blockers, review manager escalations, and provide organizational guidance"
    >
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search queries..."
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

          <button
            onClick={() => setOnlyEscalated(!onlyEscalated)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              onlyEscalated
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Escalated Only ({escalatedCount})
          </button>
        </div>
      </div>

      {/* Queries Grid */}
      {filteredQueries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">No queries found</h4>
          <p className="text-xs text-slate-500">All queries have been handled or none match filter.</p>
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

      {/* Modal */}
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
    </PortalShell>
  );
}
