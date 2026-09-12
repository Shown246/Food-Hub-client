import { redirect } from "next/navigation";
import { getSessionIdentity } from "@/lib/auth/session-identity";

interface ChangePasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChangePasswordPage({ searchParams }: ChangePasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  // If password reset token was provided via email link, route to reset-password
  if (token) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}`);
  }

  // If user is currently authenticated, redirect them to their profile's security section
  const session = await getSessionIdentity();
  if (session?.user) {
    if (session.user.role === "PROVIDER") {
      redirect("/console/provider/profile?tab=security");
    } else if (session.user.role === "ADMIN") {
      redirect("/console/admin");
    } else {
      redirect("/console/customer/profile#security-settings");
    }
  }

  // If unauthenticated with no token, redirect to forgot password flow
  redirect("/forgot-password");
}
