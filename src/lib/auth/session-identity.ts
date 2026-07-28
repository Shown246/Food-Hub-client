import "server-only";

import jwt from "jsonwebtoken";
import { cache } from "react";
import { cookies } from "next/headers";
import type { CurrentUserData, SessionIdentityData } from "@/types/auth.type";

export const SESSION_IDENTITY_COOKIE = "foodhub.session_identity";
const SESSION_IDENTITY_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const TOKEN_ISSUER = "food-hub-client";
const TOKEN_AUDIENCE = "food-hub-client";

const getSigningSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required for session identity");
  return secret;
};

const isSessionIdentity = (value: unknown): value is SessionIdentityData => {
  const identity = value as SessionIdentityData;
  const user = identity?.user;
  return Boolean(
    user &&
      typeof user.id === "string" &&
      typeof user.fullName === "string" &&
      typeof user.email === "string" &&
      ["CUSTOMER", "PROVIDER", "ADMIN"].includes(user.role) &&
      ["ACTIVE", "SUSPENDED"].includes(user.status),
  );
};

export const toSessionIdentity = (
  currentUser: CurrentUserData,
): SessionIdentityData => ({
  user: {
    id: currentUser.user.id,
    fullName: currentUser.user.fullName,
    profileImageUrl: currentUser.user.profileImageUrl,
    email: currentUser.user.email,
    role: currentUser.user.role,
    status: currentUser.user.status,
  },
  providerProfile: currentUser.providerProfile
    ? {
        id: currentUser.providerProfile.id,
        name: currentUser.providerProfile.name,
        logoUrl: currentUser.providerProfile.logoUrl,
      }
    : null,
});

export const setSessionIdentity = async (currentUser: CurrentUserData) => {
  const identity = toSessionIdentity(currentUser);
  const token = jwt.sign(identity, getSigningSecret(), {
    algorithm: "HS256",
    audience: TOKEN_AUDIENCE,
    expiresIn: SESSION_IDENTITY_MAX_AGE_SECONDS,
    issuer: TOKEN_ISSUER,
    subject: identity.user.id,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_IDENTITY_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_IDENTITY_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const deleteSessionIdentity = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_IDENTITY_COOKIE);
};

export const getSessionIdentity = cache(async (): Promise<SessionIdentityData | null> => {
  const cookieStore = await cookies();
  const hasSession = Boolean(
    cookieStore.get("better-auth.session_token")?.value ??
      cookieStore.get("__Secure-better-auth.session_token")?.value,
  );
  const token = cookieStore.get(SESSION_IDENTITY_COOKIE)?.value;
  if (!hasSession || !token) return null;

  try {
    const payload = jwt.verify(token, getSigningSecret(), {
      algorithms: ["HS256"],
      audience: TOKEN_AUDIENCE,
      issuer: TOKEN_ISSUER,
    });
    return isSessionIdentity(payload) ? payload : null;
  } catch {
    return null;
  }
});
