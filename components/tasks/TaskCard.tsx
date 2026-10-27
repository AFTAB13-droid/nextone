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
      className={`rounded-2xl p-5 sm:p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between relative bg-white border ${
        isOverdue
          ? "border-rose-300 bg-rose-50/20 shadow-xs hover:shadow-md hover:border-rose-400"
          : "border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300"
      } hover:-translate-y-0.5`}
    >
      {/* Top clean accent strip */}
      <div
        className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl ${
          isOverdue
            ? "bg-rose-500"
            : task.priority === "urgent"
            ? "bg-rose-500"
            : task.priority === "high"
            ? "bg-amber-500"
            : "bg-indigo-600"
        }`}
      />

      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                isOverdue
                  ? "bg-rose-100/80 text-rose-800 border-rose-200"
                  : "bg-slate-100 text-slate-700 border-slate-200/80"
              }`}
            >
              {task.taskId || `#${task._id.slice(-6)}`}
            </span>
            {task.parentTaskId && (
              <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md border border-cyan-200/70 flex items-center gap-1">
                <GitFork className="w-2.5 h-2.5" />
                Subtask
              </span>
            )}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold">
                <Clock className="w-2.5 h-2.5 text-rose-600" />
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
          className={`text-sm sm:text-[15px] font-bold transition-colors line-clamp-2 leading-snug tracking-tight ${
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
            className={`text-xs mt-1.5 line-clamp-2 leading-relaxed font-normal ${
              isOverdue ? "text-rose-900/80" : "text-slate-500"
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {task.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/70"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/60">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`mt-4 pt-3 border-t ${isOverdue ? "border-rose-200/60" : "border-slate-100"}`}>
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] font-medium mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Progress
            </span>
            <span className="font-bold text-slate-700">
              {task.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverdue
                  ? "bg-rose-500"
                  : task.status === "completed"
                  ? "bg-emerald-500"
                  : task.progressPercentage > 50
                  ? "bg-indigo-600"
                  : "bg-sky-500"
              }`}
              style={{ width: `${task.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Bottom Metadata: Assignee, Due Date, Comments */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div
              className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100"
              title={`Assigned to: ${task.assignedTo?.name || "Unknown"}`}
            >
              <Image
                src={getUserAvatar(task.assignedTo)}
                alt={task.assignedTo?.name || "User"}
                width={24}
                height={24}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
              {task.assignedTo?.name || "Assigned"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </span>
            )}

            <span
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                isOverdue
                  ? "text-rose-700 bg-rose-100/70 border-rose-200"
                  : "text-slate-600 bg-slate-50 border-slate-200/80"
              }`}
            >
              <Calendar className="w-3 h-3 text-slate-400" />
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
