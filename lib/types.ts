export type UserRole = "admin" | "manager" | "employee";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  managerId?: string | IUser;
  department?: string;
  designation?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  fcmTokens?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type TaskStatus = "pending" | "in_progress" | "in_review" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ITaskActivity {
  _id?: string;
  action: string;
  by: {
    _id: string | any;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  note?: string;
  timestamp: string | Date;
}

export interface ITaskComment {
  _id?: string;
  author: {
    _id: string | any;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  message: string;
  attachments?: string[];
  createdAt: string | Date;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  assignedBy: IUser;
  assignedTo: IUser;
  managerInCharge?: IUser; // For reporting context
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | Date;
  progressPercentage: number;
  tags?: string[];
  attachments?: string[];
  activityLogs: ITaskActivity[];
  comments: ITaskComment[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type QueryStatus = "open" | "in_progress" | "resolved" | "closed";
export type QueryCategory = "technical" | "clarification" | "blocker" | "resource" | "other";

export interface IQueryResponse {
  _id?: string;
  sender: {
    _id: string | any;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  message: string;
  attachments?: string[];
  createdAt: string | Date;
}

export interface IQuery {
  _id: string;
  title: string;
  description: string;
  category: QueryCategory;
  priority: "normal" | "urgent";
  raisedBy: IUser; // Employee or Manager
  assignedTo: IUser; // Manager (if raised by employee) or Admin (if raised by manager)
  escalatedTo?: IUser | any; // Admin (if escalated from manager)
  status: QueryStatus;
  responses: IQueryResponse[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface INotification {
  _id: string;
  recipient: any;
  title: string;
  message: string;
  link?: string;
  type: "task" | "query" | "system" | "hierarchy";
  isRead: boolean;
  createdAt: string | Date;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  managerId?: string;
}
