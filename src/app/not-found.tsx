"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChefHat,
  Compass,
  Home,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-orange-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-br from-orange-500/15 via-rose-500/10 to-transparent blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 size-[450px] rounded-full bg-orange-600/10 blur-[100px]"
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
            <Link
              href="/providers"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
            >
              <Store className="size-3.5" />
              <span>Providers</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 text-center">
        {/* Animated Culinary Badge Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-6"
        >
          {/* Ambient center pulse */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/30 to-rose-500/30 blur-2xl animate-pulse" />

          {/* Central Plate Icon Container */}
          <div className="relative mx-auto grid size-28 sm:size-32 place-items-center rounded-3xl border border-white/15 bg-zinc-900/80 shadow-2xl backdrop-blur-xl">
            <div className="relative">
              <UtensilsCrossed className="size-12 sm:size-14 text-orange-400 stroke-[1.75]" />
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 grid size-7 place-items-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30"
              >
                <Search className="size-3.5 stroke-[2.5]" />
              </motion.span>
            </div>
          </div>

          {/* Floating Pill: Chef searched Dhaka */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            className="absolute -left-12 sm:-left-20 top-4 hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-medium text-zinc-300 shadow-xl backdrop-blur-md"
          >
            <ChefHat className="size-3.5 text-orange-400" />
            <span>Recipe not found</span>
          </motion.div>

          {/* Floating Pill: Status 404 */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
            className="absolute -right-8 sm:-right-16 bottom-2 flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300 shadow-xl backdrop-blur-md"
          >
            <Sparkles className="size-3 text-orange-400" />
            <span>Error 404</span>
          </motion.div>
        </motion.div>

        {/* 404 Gradient Number */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400"
        >
          <span>Page Not Found</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-xl"
        >
          This dish is{" "}
          <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            off the menu!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed"
        >
          We searched every station in the kitchen, but the recipe or page
          you&apos;re looking for was either devoured, moved, or never created.
        </motion.p>

        {/* Primary and Secondary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-sm sm:max-w-md"
        >
          <Link
            href="/"
            className="group relative flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/80 active:scale-[0.98]"
          >
            <Home className="size-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Back to Homepage</span>
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="group flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-zinc-900/80 px-5 py-3 text-sm font-medium text-zinc-200 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-zinc-800 hover:text-white hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-[0.98]"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Go Back</span>
          </button>
        </motion.div>

        {/* Quick Discovery Cards / Helpful Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 w-full pt-8 border-t border-white/10"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Or try one of these popular stations:
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
                Return to the main page to see fresh offers and trending meals.
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
                Discover mouth-watering delicacies crafted by top local chefs.
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
                Connect with verified home kitchens and partner restaurants.
              </p>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Subdued Footer Note */}
      <footer className="relative z-10 w-full border-t border-white/5 py-4 text-center text-xs text-zinc-500">
        <span>Need assistance? Head back to </span>
        <Link
          href="/"
          className="font-medium text-orange-400 hover:text-orange-300 underline underline-offset-4"
        >
          FoodHub Homepage
        </Link>
        <span> or check your </span>
        <Link
          href="/console"
          className="font-medium text-zinc-400 hover:text-white underline underline-offset-4"
        >
          Account Portal
        </Link>
        .
      </footer>
    </div>
  );
}