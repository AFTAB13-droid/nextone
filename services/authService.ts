import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { AuthSession } from "@/lib/types";

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async login(email: string, password: string): Promise<{ token: string; user: AuthSession }> {
    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const userDoc = await User.findOne({ email: normalizedEmail, isActive: true }).select("+password");

    if (!userDoc || !userDoc.password) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await this.comparePassword(password, userDoc.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const sessionPayload: AuthSession = {
      userId: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      role: userDoc.role,
      managerId: userDoc.managerId ? userDoc.managerId.toString() : undefined,
    };

    const token = await signToken(sessionPayload);

    return {
      token,
      user: sessionPayload,
    };
  }
}

export default AuthService;
