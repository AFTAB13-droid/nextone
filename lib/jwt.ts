import { SignJWT, jwtVerify } from "jose";
import { AuthSession } from "@/lib/types";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "nextone_enterprise_jwt_secret_key_super_secure_9921_production";
const secretKey = new TextEncoder().encode(JWT_SECRET_STRING);

export async function signToken(payload: AuthSession): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
  return token;
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}
