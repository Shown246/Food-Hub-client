import { redirect } from "next/navigation";
// import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  // const user = await getCurrentUser();
  const user = {
    name: "John Doe",
    role: "admin"
  };
  if (!user) {
    redirect("/login");
  }

  switch (user.role) {
    case "customer":
      redirect("/console/customer");

    case "provider":
      redirect("/console/provider");

    case "admin":
      redirect("/console/admin");

    default:
      redirect("/");
  }
}