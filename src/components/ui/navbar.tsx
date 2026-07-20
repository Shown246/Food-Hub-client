"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Meals", href: "/meals" },
  { label: "Providers", href: "/providers" },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
          aria-label="FoodHub home"
        >
          <span className="relative grid size-10 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <span className="absolute inset-0 bg-linear-to-t from-black/10 to-white/20" />
            <ShoppingBag aria-hidden="true" className="relative size-5" strokeWidth={2.25} />
          </span>
          <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Food<span className="text-orange-500">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center rounded-full border border-zinc-200/80 bg-zinc-100/70 p-1 md:flex dark:border-white/10 dark:bg-white/5">
          {navigation.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60",
                  isActive
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 dark:bg-white dark:text-zinc-950 dark:hover:bg-orange-500 dark:hover:text-white dark:focus-visible:ring-offset-zinc-950"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className="grid size-10 place-items-center rounded-xl border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 md:hidden dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 md:hidden",
          isMenuOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="mx-4 mb-4 space-y-1 rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-xl shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900">
            {navigation.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60",
                    isActive
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white",
                  )}
                >
                  {item.label}
                  {isActive && <span aria-hidden="true" className="size-1.5 rounded-full bg-orange-500" />}
                </Link>
              );
            })}

            <div className="grid grid-cols-2 gap-2 border-t border-zinc-200/80 pt-2 dark:border-white/10">
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-2xl bg-zinc-100 px-4 py-3 text-center text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={closeMenu}
                className="rounded-2xl bg-zinc-950 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 dark:bg-white dark:text-zinc-950 dark:hover:bg-orange-500 dark:hover:text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
