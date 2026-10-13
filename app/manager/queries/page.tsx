"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import QueryCard from "@/components/queries/QueryCard";
import QueryModal from "@/components/queries/QueryModal";
import CreateQueryModal from "@/components/queries/CreateQueryModal";
import { HelpCircle, Search, Plus, ArrowUpRight } from "lucide-react";
import { AuthSession, IQuery } from "@/lib/types";

export default function ManagerQueriesPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [activeTab, setActiveTab] = useState<"fromTeam" | "toAdmin">("fromTeam");
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter based on tab
  const tabQueries = queries.filter((q) => {
    if (activeTab === "fromTeam") {
      // Raised by employees and assigned to this manager
      return q.assignedTo?._id === currentUser.userId;
    }
    // Raised by this manager to Admin
    return q.raisedBy?._id === currentUser.userId;
  });

  const filteredQueries = tabQueries.filter((q) => {
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      q.raisedBy?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const fromTeamCount = queries.filter((q) => q.assignedTo?._id === currentUser.userId).length;
  const toAdminCount = queries.filter((q) => q.raisedBy?._id === currentUser.userId).length;

  return (
    <PortalShell
      user={currentUser}
      title="Team Queries & Escalation Desk"
      subtitle="Answer employee inquiries, resolve blockers, escalate critical items to Admin, or consult executive leadership"
    >
      {/* Top Filter and Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Tabs */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("fromTeam")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "fromTeam" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600"
              }`}
            >
              Employee Inquiries ({fromTeamCount})
            </button>
            <button
              onClick={() => setActiveTab("toAdmin")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "toAdmin" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600"
              }`}
            >
              My Inquiries to Admin ({toAdminCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search queries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 sm:w-64 text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Raise Query Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Ask Executive Admin
        </button>
      </div>

      {/* Grid */}
      {filteredQueries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">No queries found</h4>
          <p className="text-xs text-slate-500">
            {activeTab === "fromTeam"
              ? "No queries from your subordinate employees in this filter."
              : "You have not raised any queries to Executive Admin yet."}
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
