import { requireRole } from "@/lib/auth/require-role";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["ADMIN"]);
  return children;
}
