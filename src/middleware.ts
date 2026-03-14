import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const SISTEMA_BLOQUEADO = process.env.SISTEMA_BLOQUEADO === "true";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;
  const path = req.nextUrl.pathname;

  if (SISTEMA_BLOQUEADO && path !== "/bloqueado") {
    return NextResponse.redirect(new URL("/bloqueado", req.nextUrl));
  }

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/register");
  const isDashboardRoute = path.startsWith("/dashboard");
  const isTherapistRoute = path.startsWith("/therapist");

  if (isAuthRoute && isLoggedIn) {
    const redirect = role === "THERAPIST" ? "/therapist" : "/dashboard";
    return NextResponse.redirect(new URL(redirect, req.nextUrl));
  }

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isTherapistRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isTherapistRoute && isLoggedIn && role !== "THERAPIST") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isDashboardRoute && isLoggedIn && role === "THERAPIST") {
    return NextResponse.redirect(new URL("/therapist", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
