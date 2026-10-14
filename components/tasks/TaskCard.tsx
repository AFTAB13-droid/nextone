"use client";

import React from "react";
import { Calendar, MessageSquare, Paperclip, Clock, GitFork, ChevronRight } from "lucide-react";
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
      className="rounded-[26px] bg-white p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 inset-x-0 h-1.5 ${
          task.priority === "urgent"
            ? "bg-rose-500"
            : task.priority === "high"
            ? "bg-amber-500"
            : "bg-indigo-600"
        }`}
      />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-black bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200">
              {task.taskId || `#${task._id.slice(-6)}`}
            </span>
            {task.parentTaskId && (
              <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-lg border border-cyan-200 flex items-center gap-1">
                <GitFork className="w-2.5 h-2.5" />
                Subtask
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h3>

        {/* Description snippet */}
        {task.description && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-lg border border-slate-200/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100/90">
        {/* Progress Bar with Cyan-to-Indigo Gradient */}
        <div className="mb-3.5">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              Progress
            </span>
            <span className="font-extrabold text-slate-800">{task.progressPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                task.status === "completed"
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
              className="w-7 h-7 rounded-full overflow-hidden bg-indigo-50 border border-slate-200 shadow-2xs shrink-0"
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
            <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
              {task.assignedTo?.name || "Assigned"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </span>
            )}

            <span
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                isOverdue
                  ? "text-rose-700 bg-rose-50 border border-rose-200"
                  : "text-slate-600 bg-slate-50 border border-slate-200/80"
              }`}
            >
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(task.dueDate).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
