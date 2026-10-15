import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import AuthService from "@/services/authService";
import NotificationService from "@/services/notificationService";
import { IUser, UserRole } from "@/lib/types";
import { getUserAvatar } from "@/lib/avatarHelper";

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  gender?: "male" | "female" | "other";
  managerId?: string | null;
  department?: string;
  designation?: string;
  phone?: string;
  avatar?: string;
}

const MANAGER_POPULATE_FIELDS = "name email role designation department avatar phone";

export class UserService {
  static async createUser(input: CreateUserInput): Promise<IUser> {
    await connectDB();

    const normalizedEmail = input.email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error(`User with email "${normalizedEmail}" already exists`);
    }

    const rawPassword = input.password || "NextOne@2025";
    const hashedPassword = await AuthService.hashPassword(rawPassword);

    const defaultAvatar = getUserAvatar({
      avatar: input.avatar,
      gender: input.gender || "male",
      name: input.name,
    });

    const user = await User.create({
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: input.role,
      gender: input.gender || "male",
      managerId: input.role === "employee" && input.managerId ? input.managerId : null,
      department: input.department || "General",
      designation: input.designation || (input.role === "manager" ? "Team Lead" : "Associate"),
      phone: input.phone || "",
      avatar: input.avatar || defaultAvatar,
      isActive: true,
    });

    // If an employee was assigned to a manager right away, notify the manager
    if (input.role === "employee" && input.managerId) {
      await NotificationService.createNotification(
        input.managerId,
        "New Team Member Assigned",
        `${user.name} has been added to your team by Admin.`,
        "/manager/team",
        "hierarchy"
      );
    }

    const obj = user.toObject();
    delete obj.password;
    return obj as IUser;
  }

  static async getAllUsers(): Promise<IUser[]> {
    await connectDB();
    const users = await User.find({})
      .populate("managerId", MANAGER_POPULATE_FIELDS)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return users as unknown as IUser[];
  }

  static async getUserById(userId: string): Promise<IUser | null> {
    await connectDB();
    const user = await User.findById(userId)
      .populate("managerId", MANAGER_POPULATE_FIELDS)
      .select("-password")
      .lean();

    return user as unknown as IUser;
  }

  static async getManagers(): Promise<IUser[]> {
    await connectDB();
    const managers = await User.find({ role: "manager", isActive: true })
      .select("-password")
      .sort({ name: 1 })
      .lean();

    return managers as unknown as IUser[];
  }

  static async getEmployees(): Promise<IUser[]> {
    await connectDB();
    const employees = await User.find({ role: "employee", isActive: true })
      .populate("managerId", MANAGER_POPULATE_FIELDS)
      .select("-password")
      .sort({ name: 1 })
      .lean();

    return employees as unknown as IUser[];
  }

  static async getEmployeesByManager(managerId: string): Promise<IUser[]> {
    await connectDB();
    const subordinates = await User.find({ managerId, role: "employee", isActive: true })
      .populate("managerId", MANAGER_POPULATE_FIELDS)
      .select("-password")
      .sort({ name: 1 })
      .lean();

    return subordinates as unknown as IUser[];
  }

  static async assignEmployeeToManager(employeeId: string, managerId: string | null): Promise<IUser> {
    await connectDB();

    const employee = await User.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.role !== "employee") {
      throw new Error("Only employees can be assigned to a manager");
    }

    let managerName = "Unassigned";
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== "manager") {
        throw new Error("Target manager is invalid or does not have manager role");
      }
      managerName = manager.name;
    }

    employee.managerId = managerId ? (managerId as unknown as IUser) : (null as unknown as IUser);
    await employee.save();

    // In-app notifications
    if (managerId) {
      // Notify Manager
      await NotificationService.createNotification(
        managerId,
        "Employee Assigned",
        `${employee.name} has been assigned to your supervision.`,
        "/manager/team",
        "hierarchy"
      );
      // Notify Employee
      await NotificationService.createNotification(
        employeeId,
        "Manager Assigned",
        `You have been assigned under Manager: ${managerName}.`,
        "/employee",
        "hierarchy"
      );
    }

    const updated = await User.findById(employeeId)
      .populate("managerId", MANAGER_POPULATE_FIELDS)
      .select("-password")
      .lean();

    return updated as unknown as IUser;
  }

  static async assignEmployeesToManager(managerId: string, employeeIds: string[]): Promise<void> {
    await connectDB();
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== "manager") {
      throw new Error("Target manager is invalid or does not have manager role");
    }

    for (const empId of employeeIds) {
      await this.assignEmployeeToManager(empId, managerId);
    }
  }

  static async updateUser(
    userId: string,
    updates: Partial<IUser> & { newPassword?: string }
  ): Promise<IUser | null> {
    await connectDB();

    const payload: Record<string, unknown> = { ...updates };
    if (updates.newPassword) {
      payload.password = await AuthService.hashPassword(updates.newPassword);
      delete payload.newPassword;
    }

    const updated = await User.findByIdAndUpdate(userId, { $set: payload }, { new: true })
      .populate("managerId", MANAGER_POPULATE_FIELDS)
      .select("-password")
      .lean();

    return updated as unknown as IUser;
  }

  static async deleteUser(userId: string): Promise<boolean> {
    await connectDB();
    const result = await User.findByIdAndDelete(userId);
    return Boolean(result);
  }

  static async registerFcmToken(userId: string, token: string): Promise<boolean> {
    await connectDB();
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
    return true;
  }
}

export default UserService;
