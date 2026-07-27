import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/current-user";
import { consoleForRole } from "@/lib/auth/roles";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("__Secure-better-auth.session_token")?.value ||
    cookieStore.get("accessToken")?.value;
  const currentUser = sessionToken ? await getCurrentUser() : null;
  const isLoggedIn = currentUser !== null;
  const consoleUrl = currentUser
    ? consoleForRole(currentUser.user.role)
    : "/console";

  return (
    <NavbarClient
      isLoggedIn={isLoggedIn}
      consoleUrl={consoleUrl}
    />
  );
}

export default Navbar;
