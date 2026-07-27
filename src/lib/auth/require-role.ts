import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { consoleForRole, type AppRole } from "@/lib/auth/roles";

export async function requireRole(allowedRoles: readonly AppRole[]) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!allowedRoles.includes(currentUser.user.role)) {
    redirect(consoleForRole(currentUser.user.role));
  }
  return currentUser;
}
