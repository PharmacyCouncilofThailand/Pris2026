import { Suspense } from "react";
import OrderHistory from "@/components/merchandise/OrderHistory";
import Loading from "../loading";
export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrderHistory />
    </Suspense>
  );
}
