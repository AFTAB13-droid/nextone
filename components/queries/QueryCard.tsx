"use client";

import React from "react";
import { MessageSquare, AlertCircle, ArrowUpRight, Clock, HelpCircle, Tag } from "lucide-react";
import { IQuery } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import Image from "next/image";

interface QueryCardProps {
  query: IQuery;
  onClick: (query: IQuery) => void;
}

export function QueryCard({ query, onClick }: QueryCardProps) {
  const isEscalated = Boolean(query.escalatedTo);

  return (
    <div
      onClick={() => onClick(query)}
      className="rounded-[26px] bg-white p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 ${
          query.status === "resolved"
            ? "bg-teal-500"
            : query.priority === "urgent"
            ? "bg-rose-500"
            : isEscalated
            ? "bg-purple-600"
            : "bg-indigo-600"
        }`}
      />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-black bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200">
              {query.queryId || `#${query._id.slice(-6)}`}
            </span>
            <StatusBadge status={query.status} />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              {query.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isEscalated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-purple-100 text-purple-800 text-[10px] font-black border border-purple-200">
                <ArrowUpRight className="w-3 h-3" />
                Escalated
              </span>
            )}
            <PriorityBadge priority={query.priority} />
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {query.title}
        </h3>

        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
          {query.description}
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100/90 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 ring-1 ring-slate-200 shadow-2xs shrink-0">
            <Image
              src={getUserAvatar(query.raisedBy)}
              alt={query.raisedBy?.name || "User"}
              width={28}
              height={28}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 truncate block">
              {query.raisedBy?.name || "Anonymous"}
            </span>
            <span className="text-[10px] text-slate-400 capitalize block">
              {query.raisedBy?.role || "Associate"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-xl">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>{query.responses?.length || 0}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(query.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default QueryCard;
