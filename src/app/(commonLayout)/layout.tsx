import Navbar from "@/components/ui/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/context/cart-context";
import { MealCustomizeModal } from "@/components/cart/MealCustomizeModal";
import { FloatingOrderBar } from "@/components/cart/FloatingOrderBar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function CommonLayout({children}:{children:React.ReactNode}){
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MealCustomizeModal />
      <FloatingOrderBar />
      <CartDrawer />
    </CartProvider>
  );
}