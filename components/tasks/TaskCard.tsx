"use client";

import React from "react";
import { Calendar, MessageSquare, Paperclip, Clock, GitFork } from "lucide-react";
import { ITask } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
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
      className="glass-card rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              {task.taskId || `#${task._id.slice(-6)}`}
            </span>
            {task.parentTaskId && (
              <span className="text-[10px] font-bold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md border border-cyan-200 flex items-center gap-1">
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
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h3>

        {/* Description snippet */}
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/90">
        {/* Progress Bar with Cyan-to-Indigo Gradient */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Progress</span>
            <span className="font-bold text-slate-800">{task.progressPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full overflow-hidden bg-indigo-50 border border-slate-200 shadow-2xs"
              title={`Assigned to: ${task.assignedTo?.name || "Unknown"}`}
            >
              <Image
                src={
                  task.assignedTo?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    task.assignedTo?.name || "User"
                  )}&background=6366f1&color=fff`
                }
                alt={task.assignedTo?.name || "User"}
                width={24}
                height={24}
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[100px]">
              {task.assignedTo?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </span>
            )}

            <span
              className={`flex items-center gap-1 text-[11px] font-bold ${
                isOverdue ? "text-rose-600 font-bold" : "text-slate-600"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(task.dueDate).toLocaleDateString([], {
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
