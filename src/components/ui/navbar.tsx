import { getSessionIdentity } from "@/lib/auth/session-identity";
import { consoleForRole } from "@/lib/auth/roles";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const currentUser = await getSessionIdentity();
  const isLoggedIn = currentUser !== null;
  const consoleUrl = currentUser
    ? consoleForRole(currentUser.user.role)
    : "/console";

  const userRole = currentUser?.user?.role;

  return (
    <NavbarClient
      isLoggedIn={isLoggedIn}
      userRole={userRole}
      consoleUrl={consoleUrl}
    />
  );
}

export default Navbar;
