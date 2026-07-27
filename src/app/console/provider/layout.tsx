import { requireRole } from "@/lib/auth/require-role";

export default async function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["PROVIDER"]);
  return children;
}
