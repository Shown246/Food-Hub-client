import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { consoleForRole } from "@/lib/auth/roles";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  redirect(consoleForRole(currentUser.user.role));
}
