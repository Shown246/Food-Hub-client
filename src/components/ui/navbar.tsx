import { cookies } from "next/headers";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("accessToken")?.value;
  const userRole = cookieStore.get("userRole")?.value || null;
  const isLoggedIn = !!sessionToken;

  let consoleUrl = "/console";
  if (userRole) {
    const roleUpper = userRole.toUpperCase();
    if (roleUpper === "CUSTOMER") consoleUrl = "/console/customer";
    else if (roleUpper === "PROVIDER") consoleUrl = "/console/provider";
    else if (roleUpper === "ADMIN") consoleUrl = "/console/admin";
  }

  return (
    <NavbarClient
      isLoggedIn={isLoggedIn}
      userRole={userRole}
      consoleUrl={consoleUrl}
    />
  );
}

export default Navbar;
