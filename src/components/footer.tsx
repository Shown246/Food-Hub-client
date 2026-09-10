"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Heart, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-md pt-16 pb-28 md:pb-20 text-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-border/40">
          {/* Brand & Description (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
            >
              <span className="relative grid size-9 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105">
                <ShoppingBag className="relative size-4" strokeWidth={2.25} />
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Food<span className="text-orange-500">Hub</span>
              </span>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Connecting food lovers with Dhaka&apos;s most passionate chefs, authentic local kitchens, and premier restaurants. Fresh, hygienic, and delivered hot.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-foreground mb-2">
                Subscribe for exclusive discounts &amp; new dishes
              </p>
              {isSubscribed ? (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  <Check className="size-4" />
                  <span>You&apos;re subscribed! Welcome to the FoodHub family.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background border border-border/70 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>
                  <Button type="submit" size="sm" className="rounded-xl px-4 bg-primary hover:bg-primary/90 text-xs">
                    Join
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Explore FoodHub
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/meals" className="hover:text-primary transition-colors">
                  All Meals &amp; Dishes
                </Link>
              </li>
              <li>
                <Link href="/providers" className="hover:text-primary transition-colors">
                  Local Kitchens
                </Link>
              </li>
              <li>
                <Link href="/meals?sort=price_asc" className="hover:text-primary transition-colors">
                  Budget Picks
                </Link>
              </li>
              <li>
                <Link href="/meals?dietary=halal" className="hover:text-primary transition-colors">
                  Halal Specials
                </Link>
              </li>
            </ul>
          </div>

          {/* Cuisines Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Popular Cuisines
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/meals?category=bangladeshi" className="hover:text-primary transition-colors">
                  Bangladeshi &amp; Biryani
                </Link>
              </li>
              <li>
                <Link href="/meals?category=pizza" className="hover:text-primary transition-colors">
                  Artisanal Pizza
                </Link>
              </li>
              <li>
                <Link href="/meals?category=chinese" className="hover:text-primary transition-colors">
                  Chinese &amp; Asian Wok
                </Link>
              </li>
              <li>
                <Link href="/meals?category=indian" className="hover:text-primary transition-colors">
                  Indian Curries &amp; Naan
                </Link>
              </li>
              <li>
                <Link href="/meals?category=beverages" className="hover:text-primary transition-colors">
                  Drinks &amp; Borhani
                </Link>
              </li>
            </ul>
          </div>

          {/* For Partners & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Partners &amp; Legal
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Partner with Us
                </Link>
              </li>
              <li>
                <Link href="/console" className="hover:text-primary transition-colors">
                  Provider Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/80 cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground/80 cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            <span>&copy; {new Date().getFullYear()} FoodHub Inc. Crafted with</span>
            <Heart className="size-3 text-rose-500 fill-rose-500 inline" />
            <span>for great food lovers.</span>
          </p>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
