"use client";

import dynamic from "next/dynamic";
import { FloatingOrderBar } from "@/components/cart/FloatingOrderBar";

const MealCustomizeModal = dynamic(
  () => import("@/components/cart/MealCustomizeModal").then((mod) => mod.MealCustomizeModal),
  { ssr: false }
);

const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

const ProviderConflictDialog = dynamic(
  () => import("@/components/cart/ProviderConflictDialog").then((mod) => mod.ProviderConflictDialog),
  { ssr: false }
);

export function CartClientOverlays() {
  return (
    <>
      <MealCustomizeModal />
      <FloatingOrderBar />
      <CartDrawer />
      <ProviderConflictDialog />
    </>
  );
}
