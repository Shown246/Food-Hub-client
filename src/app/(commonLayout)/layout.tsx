import Navbar from "@/components/ui/navbar";
import { CartProvider } from "@/context/cart-context";
import { MealCustomizeModal } from "@/components/cart/MealCustomizeModal";
import { FloatingOrderBar } from "@/components/cart/FloatingOrderBar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function CommonLayout({children}:{children:React.ReactNode}){
  return (
    <CartProvider>
      <Navbar />
      {children}
      <MealCustomizeModal />
      <FloatingOrderBar />
      <CartDrawer />
    </CartProvider>
  );
}