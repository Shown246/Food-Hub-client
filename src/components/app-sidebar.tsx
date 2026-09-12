"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShoppingBagIcon,
  UserIcon,
  LogOutIcon,
  UtensilsIcon,
  ShieldCheckIcon,
  StoreIcon,
} from "lucide-react";
import { logoutAction } from "@/app/console/customer/_actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { currentUserQueryKey } from "@/queries/current-user.query";
import type { SessionIdentityData } from "@/types/auth.type";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialUser?: SessionIdentityData["user"];
}

export function AppSidebar({ initialUser, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { data: currentUser } = useCurrentUser();
  const user = currentUser?.user ?? initialUser;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const customerNavItems = [
    {
      title: "Orders",
      url: "/console/customer/orders",
      icon: ShoppingBagIcon,
      isActive: pathname.startsWith("/console/customer/orders") || pathname === "/console/customer",
    },
    {
      title: "Profile",
      url: "/console/customer/profile",
      icon: UserIcon,
      isActive: pathname.startsWith("/console/customer/profile"),
    },
  ];
  const providerNavItems = [
    {
      title: "Orders",
      url: "/console/provider/orders",
      icon: ShoppingBagIcon,
      isActive: pathname.startsWith("/console/provider/orders") || pathname === "/console/provider",
    },
    {
      title: "Menu",
      url: "/console/provider/menu",
      icon: UtensilsIcon,
      isActive: pathname.startsWith("/console/provider/menu") || pathname === "/console/provider",
    },
    {
      title: "Profile",
      url: "/console/provider/profile",
      icon: UserIcon,
      isActive: pathname.startsWith("/console/provider/profile"),
    },
  ];

  const navItems = user?.role === "ADMIN"
    ? [{
        title: "Admin dashboard",
        url: "/console/admin",
        icon: ShieldCheckIcon,
        isActive: pathname.startsWith("/console/admin"),
      }]
    : user?.role === "PROVIDER"
      ? providerNavItems
      : customerNavItems;

  const portalName = user
    ? `${user.role.charAt(0)}${user.role.slice(1).toLowerCase()} Portal`
    : "FoodHub Portal";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-sidebar" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border/40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs transition-transform group-hover:scale-105">
            <UtensilsIcon className="size-5" />
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-base tracking-tight text-sidebar-foreground">FoodHub</span>
            <span className="text-xs text-muted-foreground font-medium">{portalName}</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      tooltip={item.title}
                      isActive={item.isActive}
                      className={`gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                        item.isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-3 border-t border-sidebar-border/40 space-y-3">
        {/* User Info */}
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-sidebar-accent/50 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-9 border border-border/50">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.fullName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : "CU"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold truncate text-sidebar-foreground">
              {user?.fullName || "Customer"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {user?.email || "customer@foodhub.com"}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              disabled={isLoggingOut}
              tooltip="Logout"
              className="w-full gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors group-data-[collapsible=icon]:justify-center"
            >
              <LogOutIcon className="size-5 shrink-0" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
