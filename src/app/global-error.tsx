"use client";

import { useEffect, useState } from "react";
import "./globals.css";
import { AlertTriangle, Home, RotateCcw, ShoppingBag } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.error("[FoodHub Critical Global Error]:", error);
  }, [error]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (typeof reset === "function") {
        reset();
      } else {
        window.location.reload();
      }
      setIsRetrying(false);
    }, 400);
  };

  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col justify-between bg-zinc-950 text-zinc-100 antialiased font-sans">
        {/* Top Minimal Brand Bar */}
        <header className="w-full border-b border-white/10 bg-zinc-950/80 px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2.5 rounded-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20">
                <ShoppingBag className="size-4" />
              </span>
              <span className="text-xl font-bold tracking-tight">
                Food<span className="text-orange-500">Hub</span>
              </span>
            </a>

            <a
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Home className="size-3.5" />
              <span>Back to Home</span>
            </a>
          </div>
        </header>

        {/* Center Critical Error Box */}
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 grid size-24 place-items-center rounded-3xl border border-rose-500/30 bg-zinc-900/90 shadow-2xl shadow-rose-500/10">
            <AlertTriangle className="size-10 text-rose-500" />
          </div>

          <span className="mb-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-rose-400">
            Critical App Error
          </span>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            System Needs a Quick Reboot
          </h1>

          <p className="mt-3 text-sm text-zinc-400 max-w-md leading-relaxed">
            Our application ran into a critical initialization snag. Don&apos;t
            fret—your session and credentials are safe. Please reload or return to the main hub.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <RotateCcw
                className={`size-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              <span>{isRetrying ? "Reloading..." : "Reload App"}</span>
            </button>

            <a
              href="/"
              className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all"
            >
              <Home className="size-4" />
              <span>Homepage</span>
            </a>
          </div>

          {error?.digest && (
            <p className="mt-8 font-mono text-xs text-zinc-600">
              Error Digest: {error.digest}
            </p>
          )}
        </main>

        <footer className="w-full border-t border-white/5 py-4 text-center text-xs text-zinc-600">
          FoodHub &copy; {new Date().getFullYear()} &bull; Dhaka, Bangladesh
        </footer>
      </body>
    </html>
  );
}
