import type { AuthUser } from "@/types/auth.type";

export type AppRole = AuthUser["role"];

export const consoleForRole = (role: AppRole): string => {
  switch (role) {
    case "CUSTOMER":
      return "/console/customer";
    case "PROVIDER":
      return "/console/provider";
    case "ADMIN":
      return "/console/admin";
  }
};
