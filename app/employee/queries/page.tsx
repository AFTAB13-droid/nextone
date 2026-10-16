"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import QueryCard from "@/components/queries/QueryCard";
import QueryModal from "@/components/queries/QueryModal";
import CreateQueryModal from "@/components/queries/CreateQueryModal";
import StatCard from "@/components/ui/StatCard";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import Image from "next/image";
import {
  HelpCircle,
  Search,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  List,
  LayoutGrid,
  Eye,
  Filter,
  ShieldAlert,
  Sparkles,
  Inbox,
} from "lucide-react";
import { AuthSession, IQuery } from "@/lib/types";

export default function EmployeeQueriesPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedQuery, setSelectedQuery] = useState<IQuery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved view mode from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nextone_employee_queries_view");
      if (saved === "table" || saved === "cards") {
        setViewMode(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetViewMode = (mode: "table" | "cards") => {
    setViewMode(mode);
    try {
      localStorage.setItem("nextone_employee_queries_view", mode);
    } catch {
      // ignore
    }
  };

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

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "escalated" ? Boolean(q.escalatedTo) : q.status === statusFilter);

      const matchesCategory =
        categoryFilter === "all" || q.category === categoryFilter;

      const matchesPriority =
        priorityFilter === "all" || q.priority === priorityFilter;

      const matchesSearch =
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description.toLowerCase().includes(search.toLowerCase()) ||
        (q.queryId && q.queryId.toLowerCase().includes(search.toLowerCase())) ||
        (q.assignedTo?.name && q.assignedTo.name.toLowerCase().includes(search.toLowerCase()));

      return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });
  }, [queries, statusFilter, categoryFilter, priorityFilter, search]);

  // KPI Calculations
  const totalQueries = queries.length;
  const openCount = queries.filter((q) => q.status === "open").length;
  const inProgressCount = queries.filter((q) => q.status === "in_progress").length;
  const resolvedCount = queries.filter((q) => q.status === "resolved").length;
  const escalatedCount = queries.filter((q) => Boolean(q.escalatedTo)).length;

  const handleOpenQuery = (q: IQuery) => {
    setSelectedQuery(q);
    setIsModalOpen(true);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner
          fullscreen
          message="Loading Query Desk"
          subtext="Fetching communication threads, manager responses, and escalations"
        />
      </div>
    );
  }

  return (
    <PortalShell
      user={currentUser}
      title="Ask Manager & Query Desk"
      subtitle="Direct line to your reporting supervisor: Ask questions, report technical blockers, request resources, and track resolutions"
    >
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Inquiries"
          value={totalQueries}
          subtitle="Submitted support threads"
          icon={HelpCircle}
          color="purple"
        />
        <StatCard
          title="Awaiting Response"
          value={openCount}
          subtitle="Pending manager review"
          icon={Clock}
          color="amber"
          badge={openCount > 0 ? "Action Required" : undefined}
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Currently being resolved"
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Resolved Queries"
          value={resolvedCount}
          subtitle={`${Math.round(totalQueries ? (resolvedCount / totalQueries) * 100 : 0)}% resolution rate`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search queries, ID, or manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 sm:w-72 text-xs bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-2xs font-medium transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-2xs font-bold"
          >
            <option value="all">All Statuses ({queries.length})</option>
            <option value="open">Open ({openCount})</option>
            <option value="in_progress">In Progress ({inProgressCount})</option>
            <option value="resolved">Resolved ({resolvedCount})</option>
            <option value="escalated">Escalated to Admin ({escalatedCount})</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-2xs font-bold"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="blocker">Blocker</option>
            <option value="task_question">Task Question</option>
            <option value="resource">Resource</option>
            <option value="hr">HR</option>
            <option value="other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-2xs font-bold"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* View Switcher & Action Button */}
        <div className="flex items-center gap-3">
          {/* Table vs Cards Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => handleSetViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
              onClick={() => handleSetViewMode("cards")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
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

          {/* Raise Query Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 btn-action"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Reporting Manager</span>
          </button>
        </div>
      </div>

      {/* Main Content: Table or Cards View */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Inquiries & Support Registry ({filteredQueries.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any row to open full thread discussion and replies
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200">
              {openCount} Open • {resolvedCount} Resolved
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="px-6 py-4">Query ID & Subject</th>
                  <th className="px-6 py-4">Addressed Manager</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Responses</th>
                  <th className="px-6 py-4">Logged On</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center text-slate-400 font-medium">
                      <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                      <p className="font-bold text-slate-700">No queries found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {search || statusFilter !== "all" || categoryFilter !== "all"
                          ? "Try adjusting your filters or search keywords."
                          : "Have a blocker or question? Click 'Ask Reporting Manager' above to begin a thread."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((q) => {
                    const isEscalated = Boolean(q.escalatedTo);

                    return (
                      <tr
                        key={q._id}
                        onClick={() => handleOpenQuery(q)}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer border-b border-slate-100"
                      >
                        {/* Query ID & Subject */}
                        <td className="px-6 py-4.5 max-w-[280px]">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                              {q.queryId || `#${q._id.slice(-6)}`}
                            </span>
                            {isEscalated && (
                              <span className="text-[9px] font-extrabold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-0.5">
                                <ArrowUpRight className="w-2.5 h-2.5" />
                                Escalated
                              </span>
                            )}
                          </div>
                          <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-sm line-clamp-1">
                            {q.title}
                          </p>
                          <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                            {q.description}
                          </p>
                        </td>

                        {/* Addressed Manager */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                              <Image
                                src={getUserAvatar(q.assignedTo)}
                                alt={q.assignedTo?.name || "Manager"}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">
                                {q.assignedTo?.name || "Manager"}
                              </p>
                              {isEscalated ? (
                                <p className="text-[10px] text-purple-600 font-extrabold flex items-center gap-0.5">
                                  <ArrowUpRight className="w-2.5 h-2.5" /> Escalated to Admin
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400 truncate">
                                  {q.assignedTo?.designation || "Reporting Lead"}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {q.category}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4.5">
                          <PriorityBadge priority={q.priority} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={q.status} />
                            {q.status === "in_progress" && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                          </div>
                        </td>

                        {/* Responses */}
                        <td className="px-6 py-4.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{q.responses?.length || 0}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4.5 text-slate-500 font-mono text-[11px]">
                          {new Date(q.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenQuery(q)}
                            className="px-3.5 py-2 text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200/80 shadow-2xs transition-all duration-200 inline-flex items-center gap-1.5 btn-action"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        filteredQueries.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">No queries raised yet</h4>
            <p className="text-xs text-slate-500">
              Have a question or blocked on a task? Click &quot;Ask Reporting Manager&quot; above to message your manager.
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
        )
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
