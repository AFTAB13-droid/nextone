import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { AuthSession } from "@/lib/types";

export const AUTH_COOKIE_NAME = "nextone_token";

export async function getCurrentUser(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return await verifyToken(token);
}

export async function requireAuth(allowedRoles?: string[]): Promise<AuthSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please login first");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient privileges");
  }
  return user;
}
