"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, Sparkles, Clock, ShieldCheck, Star, UtensilsCrossed, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRENDING_SEARCHES = [
  { label: "Kacchi Biryani", query: "Biryani" },
  { label: "Pepperoni Pizza", query: "Pizza" },
  { label: "Noodles", query: "Noodles" },
  { label: "Chilli Chicken", query: "Chicken" },
  { label: "Garlic Naan", query: "Naan" },
];

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/meals?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/meals");
    }
  };

  const handleQuickSearch = (query: string) => {
    router.push(`/meals?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      {/* Background Glows & Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-rose-500/10 blur-[130px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 blur-[120px] -z-10 pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-xs">
              <Sparkles className="size-4 animate-pulse" />
              <span>Dhaka&apos;s Premier Culinary Destination</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Savor Delicious Meals,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500">
                Crafted by Top Chefs
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Explore handcrafted recipes and culinary favorites from top-rated local kitchens,
              freshly made on order and delivered piping hot to your table.
            </p>

            {/* Search Box */}
            <form
              onSubmit={handleSearch}
              className="relative max-w-xl mx-auto lg:mx-0 flex items-center bg-card/90 border border-border/80 rounded-2xl p-1.5 sm:p-2 shadow-xl shadow-orange-500/5 backdrop-blur-md transition-all focus-within:border-orange-500/70 focus-within:ring-2 focus-within:ring-orange-500/20"
            >
              <div className="pl-3 sm:pl-4 text-muted-foreground">
                <Search className="size-5" />
              </div>
              <input
                type="text"
                placeholder="Search for biryani, pizza, burger, noodles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <Button
                type="submit"
                className="rounded-xl px-5 sm:px-6 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-medium shadow-md shadow-orange-500/25 transition-all"
              >
                Find Food
              </Button>
            </form>

            {/* Trending Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">Trending:</span>
              {TRENDING_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickSearch(item.query)}
                  className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-orange-500/10 hover:text-orange-500 border border-border/50 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/meals">
                <Button size="lg" className="rounded-xl px-6 gap-2 font-semibold bg-primary hover:bg-primary/90 shadow-md">
                  <UtensilsCrossed className="size-4" />
                  <span>Explore All Meals</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/providers">
                <Button size="lg" variant="outline" className="rounded-xl px-6 gap-2 font-semibold border-border/80 hover:bg-accent/50">
                  <Store className="size-4 text-primary" />
                  <span>Meet Our Kitchens</span>
                </Button>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1 text-foreground font-bold text-lg sm:text-xl">
                  <span>500+</span>
                </div>
                <span className="text-xs text-muted-foreground">Curated Meals</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1 text-foreground font-bold text-lg sm:text-xl">
                  <Clock className="size-4 text-orange-500" />
                  <span>25 min</span>
                </div>
                <span className="text-xs text-muted-foreground">Avg. Delivery</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1 text-foreground font-bold text-lg sm:text-xl">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5</span>
                </div>
                <span className="text-xs text-muted-foreground">Happy Reviews</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual & Floating Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Outer Glow Ring */}
            <div className="relative w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[16/11] sm:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-orange-500/10 group">
                <Image
                  src="/hero-food.jpg"
                  alt="Delicious food spread featuring ramen, gourmet burger, sushi, and biryani"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Floating Badge inside Image */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-background/85 backdrop-blur-md text-foreground border border-white/10 shadow-md gap-1.5 px-3 py-1.5">
                    <Sparkles className="size-3.5 text-orange-500" />
                    <span className="font-semibold text-xs">Fresh On-Demand</span>
                  </Badge>
                </div>

                {/* Banner Caption inside Image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-wider font-semibold text-orange-400">Chef&apos;s Highlight</p>
                  <p className="text-base sm:text-lg font-bold leading-snug drop-shadow-sm">
                    Authentic Flavors, Delivered Right To Your Door
                  </p>
                </div>
              </div>

              {/* Floating Glassmorphic Promo Card: Top Right */}
              <div className="absolute -top-5 -right-3 sm:-right-6 bg-card/90 border border-border/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-black/10 hidden sm:flex items-center gap-3 animate-bounce [animation-duration:4s]">
                <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Superfast Express</p>
                  <p className="text-[11px] text-muted-foreground">Within 15-30 mins</p>
                </div>
              </div>

              {/* Floating Glassmorphic Promo Card: Bottom Left */}
              <div className="absolute -bottom-5 -left-3 sm:-left-6 bg-card/90 border border-border/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl shadow-black/10 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">100% Quality Guaranteed</p>
                  <p className="text-[11px] text-muted-foreground">Hygienic &amp; Halal certified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
