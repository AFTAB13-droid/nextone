"use client";

import React from "react";
import { MessageSquare, AlertCircle, ArrowUpRight, Clock } from "lucide-react";
import { IQuery } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
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
      className="glass-card rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {query.queryId || `#${query._id.slice(-6)}`}
            </span>
            <StatusBadge status={query.status} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {query.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isEscalated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                <ArrowUpRight className="w-3 h-3" />
                Escalated
              </span>
            )}
            <PriorityBadge priority={query.priority} />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {query.title}
        </h3>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
          {query.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/90 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
            <Image
              src={
                query.raisedBy?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  query.raisedBy?.name || "User"
                )}&background=6366f1&color=fff`
              }
              alt={query.raisedBy?.name || "User"}
              width={24}
              height={24}
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="text-[11px] font-bold text-slate-700 truncate max-w-[110px]">
            {query.raisedBy?.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <MessageSquare className="w-3.5 h-3.5" />
            {query.responses?.length || 0}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(query.createdAt).toLocaleDateString([], {
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
