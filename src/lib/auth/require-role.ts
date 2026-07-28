import "server-only";

import { redirect } from "next/navigation";
import { getSessionIdentity } from "@/lib/auth/session-identity";
import { consoleForRole, type AppRole } from "@/lib/auth/roles";

export async function requireRole(allowedRoles: readonly AppRole[]) {
  const currentUser = await getSessionIdentity();
  if (!currentUser) redirect("/login");
  if (!allowedRoles.includes(currentUser.user.role)) {
    redirect(consoleForRole(currentUser.user.role));
  }
  return currentUser;
}
