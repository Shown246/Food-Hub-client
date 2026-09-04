import { redirect } from 'next/navigation'

export default function ProviderConsolePage() {
  return redirect("/console/provider/orders")
}