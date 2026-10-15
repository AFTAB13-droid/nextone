"use client";

import React, { useState, useEffect } from "react";
import PortalShell from "@/components/layout/PortalShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import QueryCard from "@/components/queries/QueryCard";
import QueryModal from "@/components/queries/QueryModal";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import {
  HelpCircle,
  Search,
  ArrowUpRight,
  List,
  LayoutGrid,
  MessageSquare,
  Users,
  Shield,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AuthSession, IQuery } from "@/lib/types";
import Image from "next/image";

export default function AdminQueriesPage() {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [activeTab, setActiveTab] = useState<"employee_queries" | "manager_queries" | "all">(
    "employee_queries"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [onlyEscalated, setOnlyEscalated] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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
      <div className="min-h-screen bg-portal-pattern flex items-center justify-center">
        <LoadingSpinner fullscreen message="Loading Query Resolution Center" subtext="Decrypting cross-hierarchy queries, escalations, and executive replies" />
      </div>
    );
  }

  // Segment queries by tab
  const employeeQueries = queries.filter((q) => q.raisedBy?.role === "employee");
  const managerQueries = queries.filter((q) => q.raisedBy?.role === "manager");

  const tabQueries =
    activeTab === "employee_queries"
      ? employeeQueries
      : activeTab === "manager_queries"
      ? managerQueries
      : queries;

  const filteredQueries = tabQueries.filter((q) => {
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const matchesEscalated = !onlyEscalated || Boolean(q.escalatedTo);
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      q.raisedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (q.queryId && q.queryId.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesEscalated && matchesSearch;
  });

  const escalatedCount = queries.filter((q) => q.escalatedTo && q.status !== "resolved").length;

  const handleOpenQuery = (q: IQuery) => {
    setSelectedQuery(q);
    setIsModalOpen(true);
  };

  return (
    <PortalShell
      user={currentUser}
      title="Query Resolution & Operations Desk"
      subtitle="Executive Triage: Monitor team escalations, resolve employee blockers, and address direct manager requests"
    >
      {/* Top Segmented Tabs: Employees' Queries vs Managers' Queries */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("employee_queries")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "employee_queries"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Employees&apos; Queries ({employeeQueries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("manager_queries")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "manager_queries"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Managers&apos; Queries to Admin ({managerQueries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === "all"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All ({queries.length})</span>
          </button>
        </div>

        {/* View Switcher: Table vs Cards */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
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
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search queries, employee blockers, technical inquiries (e.g. UPI, Aarav)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 sm:w-80 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 shadow-sm font-bold"
          >
            <option value="all">All Statuses ({tabQueries.length})</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="reopened">Reopened</option>
          </select>

          <button
            onClick={() => setOnlyEscalated(!onlyEscalated)}
            className={`px-4 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border ${
              onlyEscalated
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Escalated Only ({escalatedCount})</span>
          </button>
        </div>
      </div>

      {/* ================= QUERIES: TABLE VIEW OR CARDS VIEW ================= */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {activeTab === "employee_queries"
                  ? "Employees' Escalations & Blockers"
                  : activeTab === "manager_queries"
                  ? "Managers' Direct Inquiries to Admin"
                  : "All Organization Queries"}{" "}
                ({filteredQueries.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click &apos;Inspect Thread&apos; to view messages, attachments, or enter resolution details
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-white px-3 py-1 rounded-xl border border-slate-200">
              {filteredQueries.filter((q) => q.status === "open").length} Open Needs Attention
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="px-6 py-4">Query ID & Subject</th>
                  <th className="px-6 py-4">Raised By</th>
                  <th className="px-6 py-4">Target Recipient</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Responses</th>
                  <th className="px-6 py-4">Logged On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                      <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      No queries match the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((q) => {
                    const isEscalated = Boolean(q.escalatedTo);

                    return (
                      <tr
                        key={q._id}
                        onClick={() => handleOpenQuery(q)}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      >
                        {/* Query ID & Subject */}
                        <td className="px-6 py-4.5 max-w-[260px]">
                          <div className="flex items-center gap-1.5 mb-1">
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

                        {/* Raised By */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                              <Image
                                src={getUserAvatar(q.raisedBy)}
                                alt={q.raisedBy?.name || "User"}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">
                                {q.raisedBy?.name || "User"}
                              </p>
                              <p className="text-[10px] text-slate-400 capitalize">
                                {q.raisedBy?.role || "Associate"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Target Recipient */}
                        <td className="px-6 py-4.5">
                          <div className="text-xs font-semibold text-slate-700">
                            {q.assignedTo?.name || "Operations Manager"}
                          </div>
                          {q.escalatedTo && (
                            <span className="text-[10px] text-purple-600 font-bold block mt-0.5">
                              → Admin In Charge
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {q.category}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4.5">
                          <PriorityBadge priority={q.priority} />
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4.5">
                          <StatusBadge status={q.status} />
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
                            className="px-4 py-2 text-xs font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200/80 shadow-2xs transition-all duration-200 inline-flex items-center gap-1.5 btn-action"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQueries.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-[32px] p-12 text-center text-slate-400 font-medium border border-slate-200">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">No queries match the filter</h4>
              <p className="text-xs text-slate-500">All questions or blockers are addressed.</p>
            </div>
          ) : (
            filteredQueries.map((q) => (
              <QueryCard
                key={q._id}
                query={q}
                onClick={(query) => handleOpenQuery(query)}
              />
            ))
          )}
        </div>
      )}

      {/* Query Modal Thread */}
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
