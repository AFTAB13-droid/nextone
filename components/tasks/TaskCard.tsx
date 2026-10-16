"use client";

import React from "react";
import { Calendar, MessageSquare, Paperclip, Clock, GitFork, ChevronRight, Flame, AlertTriangle } from "lucide-react";
import { ITask } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { getUserAvatar } from "@/lib/avatarHelper";
import Image from "next/image";

interface TaskCardProps {
  task: ITask;
  onClick: (task: ITask) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue =
    task.status !== "completed" && task.status !== "cancelled" && new Date(task.dueDate) < new Date();

  return (
    <div
      onClick={() => onClick(task)}
      className={`rounded-[26px] p-5 sm:p-6 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden ${
        isOverdue
          ? "bg-gradient-to-br from-rose-50/95 via-red-50/80 to-rose-100/50 border border-rose-300 ring-2 ring-rose-400/30 shadow-lg shadow-rose-500/10 hover:shadow-2xl hover:shadow-rose-500/20 hover:border-rose-400 hover:-translate-y-1"
          : "bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300"
      }`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 ${
          isOverdue
            ? "bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 animate-pulse"
            : task.priority === "urgent"
            ? "bg-rose-500"
            : task.priority === "high"
            ? "bg-amber-500"
            : "bg-indigo-600"
        }`}
      />

      {/* Overdue Watermark Graphic */}
      {isOverdue && (
        <div className="absolute -right-4 -bottom-4 pointer-events-none opacity-[0.08] text-rose-600 group-hover:opacity-[0.14] transition-opacity duration-300">
          <Flame className="w-32 h-32" />
        </div>
      )}

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                isOverdue
                  ? "bg-rose-100 text-rose-900 border-rose-200"
                  : "bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              {task.taskId || `#${task._id.slice(-6)}`}
            </span>
            {task.parentTaskId && (
              <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg border border-cyan-200 flex items-center gap-1">
                <GitFork className="w-2.5 h-2.5" />
                Subtask
              </span>
            )}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm shadow-rose-600/30 animate-pulse">
                <Flame className="w-3 h-3 text-amber-300" />
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-sm sm:text-base font-black transition-colors line-clamp-2 leading-snug ${
            isOverdue
              ? "text-rose-950 group-hover:text-rose-600"
              : "text-slate-900 group-hover:text-indigo-600"
          }`}
        >
          {task.title}
        </h3>

        {/* Description snippet */}
        {task.description && (
          <p
            className={`text-xs mt-1.5 line-clamp-2 leading-relaxed font-medium ${
              isOverdue ? "text-rose-800/85" : "text-slate-500"
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                  isOverdue
                    ? "bg-rose-100/70 text-rose-800 border-rose-200"
                    : "bg-slate-50 text-slate-600 border-slate-200/80"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={`mt-5 pt-3.5 border-t ${isOverdue ? "border-rose-200/80" : "border-slate-100/90"}`}>
        {/* Progress Bar */}
        <div className="mb-3.5">
          <div className="flex justify-between text-[11px] font-medium mb-1.5">
            <span
              className={`text-[10px] uppercase font-black tracking-wider ${
                isOverdue ? "text-rose-700" : "text-slate-400"
              }`}
            >
              Progress
            </span>
            <span className={`font-extrabold ${isOverdue ? "text-rose-950" : "text-slate-800"}`}>
              {task.progressPercentage}%
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              isOverdue ? "bg-rose-200/70" : "bg-slate-100"
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverdue
                  ? "bg-gradient-to-r from-rose-500 to-red-600"
                  : task.status === "completed"
                  ? "bg-emerald-500"
                  : task.progressPercentage > 50
                  ? "bg-gradient-to-r from-indigo-500 to-cyan-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${task.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Bottom Metadata: Assignee, Due Date, Comments */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div
              className={`w-7 h-7 rounded-full overflow-hidden shrink-0 border ${
                isOverdue ? "bg-rose-100 border-rose-300 ring-2 ring-rose-400/20" : "bg-indigo-50 border-slate-200"
              }`}
              title={`Assigned to: ${task.assignedTo?.name || "Unknown"}`}
            >
              <Image
                src={getUserAvatar(task.assignedTo)}
                alt={task.assignedTo?.name || "User"}
                width={28}
                height={28}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <span
              className={`text-xs font-bold truncate max-w-[110px] ${
                isOverdue ? "text-rose-900" : "text-slate-800"
              }`}
            >
              {task.assignedTo?.name || "Assigned"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {task.comments && task.comments.length > 0 && (
              <span
                className={`flex items-center gap-1 text-[11px] font-bold ${
                  isOverdue ? "text-rose-700" : "text-slate-400"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </span>
            )}

            <span
              className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl transition-all ${
                isOverdue
                  ? "text-white bg-gradient-to-r from-rose-600 to-red-600 shadow-xs shadow-rose-600/30 animate-pulse"
                  : "text-slate-600 bg-slate-50 border border-slate-200/80"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
