"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Home,
  LayoutDashboard,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";

interface ConsoleErrorProps {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
  unstable_retry?: () => void;
}

export default function ConsoleError({
  error,
  reset,
  retry,
  unstable_retry,
}: ConsoleErrorProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("[FoodHub Console Error]:", error);
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

  const handleCopyDetails = async () => {
    const errorDetails = `Console Error: ${error.name || "Error"} - ${error.message || "Unknown error"}\nDigest: ${error.digest || "N/A"}\nTimestamp: ${new Date().toISOString()}`;
    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 text-center">
      {/* Background Accent Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-orange-500/10 blur-[100px]"
      />

      {/* Warning Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 mx-auto max-w-lg rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle className="size-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
          Console Malfunction
        </span>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
          Couldn&apos;t load this section
        </h2>

        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          An error occurred while communicating with the console management services.
          You can retry the action, return to the console overview, or head back to the main homepage.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            <RotateCcw
              className={`size-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
          </button>

          <Link
            href="/"
            className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold text-zinc-200 shadow-sm transition-all hover:bg-zinc-700 hover:text-white"
          >
            <Home className="size-4" />
            <span>Homepage</span>
          </Link>
        </div>

        {/* Secondary Dashboard Link */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <Link
            href="/console"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-orange-400 transition-colors"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Console Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Diagnostic Accordion */}
        <div className="mt-6 pt-4 border-t border-white/10 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <span>{showDetails ? "Hide technical error" : "Show technical error"}</span>
            <ChevronDown
              className={`size-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
            />
          </button>

          {showDetails && (
            <div className="mt-2 rounded-lg bg-zinc-950/80 border border-white/10 p-3 text-xs font-mono text-zinc-400">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/5">
                <span className="text-[11px] text-zinc-500">Error info</span>
                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
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
              <p className="break-words text-rose-300 text-xs">
                {error.message || "An unknown error occurred"}
              </p>
              {error.digest && (
                <p className="mt-1 text-zinc-500 text-[11px]">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
