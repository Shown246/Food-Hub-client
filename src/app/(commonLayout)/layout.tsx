import Navbar from "@/components/ui/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/context/cart-context";
import { CartClientOverlays } from "@/components/cart/cart-client-overlays";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartClientOverlays />
    </CartProvider>
  );
}