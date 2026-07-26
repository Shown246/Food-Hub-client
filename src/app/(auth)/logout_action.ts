'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { deleteCookie, getCookie } from "@/lib/cookieUtils";
import { redirect } from "next/navigation";

export const logoutAction = async (): Promise<void> => {
  try {
    const sessionToken = await getCookie("better-auth.session_token");
    const accessToken = await getCookie("accessToken");
    const token = sessionToken || accessToken;

    const cookieHeader: string[] = [];
    if (sessionToken) cookieHeader.push(`better-auth.session_token=${sessionToken}`);
    if (accessToken) cookieHeader.push(`accessToken=${accessToken}`);

    const headers: Record<string, string> = {};
    if (cookieHeader.length > 0) {
      headers["Cookie"] = cookieHeader.join("; ");
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await httpClient.post("/api/auth/logout", {}, { headers });
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    await deleteCookie("better-auth.session_token");
    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    await deleteCookie("userRole");
    redirect("/login");
  }
};
