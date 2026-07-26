import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Console - FoodHub",
  description: "FoodHub Customer & Management Portal",
};

export default function ConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-card/50 backdrop-blur-xs sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-foreground" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Customer Console
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
