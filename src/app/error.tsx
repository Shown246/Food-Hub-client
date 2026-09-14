"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Compass,
  Copy,
  Flame,
  Home,
  RotateCcw,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
  unstable_retry?: () => void;
}

export default function GlobalRouteError({
  error,
  reset,
  retry,
  unstable_retry,
}: ErrorProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log the error to console or error reporting service
    console.error("[FoodHub Error Boundary]:", error);
  }, [error]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (typeof retry === "function") {
        retry();
      } else if (typeof unstable_retry === "function") {
        unstable_retry();
      } else if (typeof reset === "function") {
        reset();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      }
      setIsRetrying(false);
    }, 400);
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleCopyDetails = async () => {
    const errorDetails = `Error: ${error.name || "Error"} - ${error.message || "Unknown error"}\nDigest: ${error.digest || "N/A"}\nTimestamp: ${new Date().toISOString()}\nPath: ${typeof window !== "undefined" ? window.location.pathname : "N/A"}`;
    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-orange-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-br from-rose-500/15 via-amber-500/10 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 size-[450px] rounded-full bg-amber-600/10 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-0 size-[350px] rounded-full bg-rose-600/10 blur-[90px]"
      />

      {/* Top Brand Header */}
      <header className="relative z-10 w-full border-b border-white/10 bg-zinc-950/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            aria-label="FoodHub home"
          >
            <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105">
              <ShoppingBag className="relative size-4" strokeWidth={2.25} />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Food<span className="text-orange-500">Hub</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium text-zinc-300">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
            >
              <Home className="size-3.5" />
              <span>Home</span>
            </Link>
            <Link
              href="/meals"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
            >
              <UtensilsCrossed className="size-3.5" />
              <span>Meals</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Error Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 text-center">
        {/* Animated Emergency Icon Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-6"
        >
          {/* Ambient Warning Pulse */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500/30 to-amber-500/30 blur-2xl animate-pulse" />

          {/* Central Caution Box */}
          <div className="relative mx-auto grid size-28 sm:size-32 place-items-center rounded-3xl border border-rose-500/30 bg-zinc-900/85 shadow-2xl backdrop-blur-xl">
            <div className="relative">
              <Flame className="size-12 sm:size-14 text-rose-500 stroke-[1.75]" />
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 grid size-7 place-items-center rounded-full bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/30"
              >
                <AlertTriangle className="size-3.5 stroke-[2.5]" />
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Error Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-rose-300"
        >
          <span>Kitchen Malfunction</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-xl"
        >
          Something simmered over in{" "}
          <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            the kitchen!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed"
        >
          An unexpected error occurred while preparing this dish. Don&apos;t
          worry, our kitchen crew has been alerted and your account data is safe.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md"
        >
          {/* Try Again Button */}
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="group relative flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/80 active:scale-[0.98] disabled:opacity-60"
          >
            <RotateCcw
              className={`size-4 transition-transform ${
                isRetrying ? "animate-spin" : "group-hover:-rotate-45"
              }`}
            />
            <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
          </button>

          {/* Return to Homepage Button */}
          <Link
            href="/"
            className="group flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-zinc-900/80 px-5 py-3 text-sm font-semibold text-zinc-100 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-zinc-800 hover:border-orange-500/40 hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 active:scale-[0.98]"
          >
            <Home className="size-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Return to Homepage</span>
          </Link>

          {/* Go Back Button */}
          <button
            type="button"
            onClick={handleGoBack}
            className="group flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
        </motion.div>

        {/* Collapsible Technical Error Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 w-full max-w-md"
        >
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <span>{showDetails ? "Hide technical details" : "Show technical details"}</span>
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${
                showDetails ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDetails && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 p-4 text-left shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-semibold text-zinc-400">Diagnostic Information</span>
                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-2 space-y-1.5 font-mono text-xs text-zinc-300">
                {error.digest && (
                  <p>
                    <span className="text-zinc-500">Digest: </span>
                    <span className="text-amber-400">{error.digest}</span>
                  </p>
                )}
                <p className="break-words">
                  <span className="text-zinc-500">Message: </span>
                  <span className="text-rose-300">{error.message || "An unknown runtime error occurred."}</span>
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Discovery Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-12 w-full pt-8 border-t border-white/10"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Looking for something else?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
            <Link
              href="/"
              className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-4 transition-all duration-200 hover:border-orange-500/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-orange-500/15 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Home className="size-4" />
                </span>
                <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                  Homepage
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Head back to our main kitchen hub to explore today&apos;s recommendations.
              </p>
            </Link>

            <Link
              href="/meals"
              className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-4 transition-all duration-200 hover:border-orange-500/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-rose-500/15 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <UtensilsCrossed className="size-4" />
                </span>
                <span className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors">
                  Browse Meals
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Browse our full catalog of delicious chef preparations and delicacies.
              </p>
            </Link>

            <Link
              href="/providers"
              className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-900/60 p-4 transition-all duration-200 hover:border-orange-500/40 hover:bg-zinc-900 hover:shadow-lg hover:shadow-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Compass className="size-4" />
                </span>
                <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Explore Providers
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                Discover independent cloud kitchens and local culinary masters.
              </p>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-4 text-center text-xs text-zinc-500">
        <span>Persistent issue? Return to the </span>
        <Link
          href="/"
          className="font-medium text-orange-400 hover:text-orange-300 underline underline-offset-4"
        >
          FoodHub Homepage
        </Link>
        <span> or contact support.</span>
      </footer>
    </div>
  );
}