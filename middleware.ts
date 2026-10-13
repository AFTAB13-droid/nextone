import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "nextone_enterprise_jwt_secret_key_super_secure_9921_production";
const secretKey = new TextEncoder().encode(JWT_SECRET_STRING);

interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "employee";
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("nextone_token")?.value;

  const isAuthRoute = pathname === "/login";
  const isProfileRoute = pathname.startsWith("/profile");
  const isAdminRoute = pathname.startsWith("/admin");
  const isManagerRoute = pathname.startsWith("/manager");
  const isEmployeeRoute = pathname.startsWith("/employee");

  const session = token ? await verifyToken(token) : null;

  // Root path redirect
  if (pathname === "/") {
    if (session) {
      if (session.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
      if (session.role === "manager") return NextResponse.redirect(new URL("/manager", request.url));
      return NextResponse.redirect(new URL("/employee", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If visiting /login while already logged in
  if (isAuthRoute && session) {
    if (session.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
    if (session.role === "manager") return NextResponse.redirect(new URL("/manager", request.url));
    return NextResponse.redirect(new URL("/employee", request.url));
  }

  // Protected routes check
  if (isProfileRoute || isAdminRoute || isManagerRoute || isEmployeeRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isProfileRoute) {
      return NextResponse.next();
    }

    // Role-based authorization
    if (isAdminRoute && session.role !== "admin") {
      // Non-admins cannot access /admin
      return NextResponse.redirect(new URL(`/${session.role}`, request.url));
    }

    if (isManagerRoute && session.role !== "manager" && session.role !== "admin") {
      // Employees cannot access /manager
      return NextResponse.redirect(new URL("/employee", request.url));
    }

    if (isEmployeeRoute && session.role !== "employee" && session.role !== "admin") {
      // Managers redirected to manager dashboard
      return NextResponse.redirect(new URL("/manager", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/profile/:path*",
    "/admin/:path*",
    "/manager/:path*",
    "/employee/:path*",
  ],
};
