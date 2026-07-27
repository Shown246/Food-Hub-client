import "server-only";

import { cookies, headers as getNextHeaders } from "next/headers";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

export async function getBackendAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const forwardedCookies: string[] = [];

  for (const name of SESSION_COOKIE_NAMES) {
    const value = cookieStore.get(name)?.value;
    if (value) forwardedCookies.push(`${name}=${value}`);
  }

  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) forwardedCookies.push(`accessToken=${accessToken}`);

  const requestHeaders = await getNextHeaders();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (host ? `${protocol}://${host}` : "http://localhost:3000");

  const headers: Record<string, string> = { Origin: origin };
  if (forwardedCookies.length > 0) {
    headers.Cookie = forwardedCookies.join("; ");
  }

  const bearerToken =
    cookieStore.get("better-auth.session_token")?.value ??
    cookieStore.get("__Secure-better-auth.session_token")?.value ??
    accessToken;
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;

  return headers;
}
