import { redirect } from "next/navigation";
import { getSessionIdentity } from "@/lib/auth/session-identity";
import { consoleForRole } from "@/lib/auth/roles";

export default async function DashboardPage() {
  const currentUser = await getSessionIdentity();
  if (!currentUser) redirect("/login");
  redirect(consoleForRole(currentUser.user.role));
}
