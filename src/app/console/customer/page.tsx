import { redirect } from "next/navigation";

export default function CustomerConsolePage() {
  redirect("/console/customer/orders");
}