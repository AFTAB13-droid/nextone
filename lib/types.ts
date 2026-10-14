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

// Client specified: Assigned, In Progress, On Hold, Completed, Cancelled (with review support)
export type TaskStatus =
  | "assigned"
  | "in_progress"
  | "on_hold"
  | "in_review"
  | "completed"
  | "cancelled"
  | "pending"
  | "blocked";

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
  taskId?: string; // Formatted unique ID e.g. TSK-1001
  title: string;
  description: string;
  assignedBy: IUser;
  assignedTo: IUser;
  managerInCharge?: IUser; // For reporting context
  parentTaskId?: string | ITask | any; // For split sub-tasks
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | Date;
  completionDate?: string | Date;
  progressPercentage: number;
  tags?: string[];
  attachments?: string[];
  activityLogs: ITaskActivity[];
  comments: ITaskComment[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Client specified: Open, In Progress, Resolved, Reopened, Closed
export type QueryStatus = "open" | "in_progress" | "resolved" | "reopened" | "closed";
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
  queryId?: string; // Formatted unique ID e.g. QRY-1001
  title: string;
  description: string;
  category: QueryCategory;
  priority: "normal" | "urgent";
  raisedBy: IUser; // Employee or Manager
  assignedTo: IUser; // Manager (if raised by employee) or Admin (if raised by manager)
  escalatedTo?: IUser | any; // Admin (if escalated from manager)
  status: QueryStatus;
  resolvedBy?: IUser | any;
  resolvedAt?: string | Date;
  resolutionNotes?: string;
  responses: IQueryResponse[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Section 6: Today's Target - Daily Employee Commitments
export interface ITargetComment {
  _id?: string;
  author: {
    _id: string | any;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  message: string;
  createdAt: string | Date;
}

export interface ITarget {
  _id: string;
  employee: IUser | any;
  date: string; // YYYY-MM-DD
  targetText: string;
  progressNotes?: string;
  status?: "pending" | "in_progress" | "achieved" | "partially_achieved";
  comments: ITargetComment[];
  lastUpdatedTime: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Section 7: Personal Private Notes
export interface INote {
  _id: string;
  user: string | any;
  title: string;
  content: string;
  tag?: string;
  color?: string;
  isPinned?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Section 8: Personal Private To-Do List
export interface ITodo {
  _id: string;
  user: string | any;
  text: string;
  completed: boolean;
  completedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface INotification {
  _id: string;
  recipient: any;
  title: string;
  message: string;
  link?: string;
  type: "task" | "query" | "target" | "system" | "hierarchy";
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
