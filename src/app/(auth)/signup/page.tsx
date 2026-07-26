import { SignupForm } from "@/components/signup-form";
import { GalleryVerticalEndIcon, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
        <Link
          href="/"
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
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/login.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5]"
        />
      </div>
    </div>
  );
}
