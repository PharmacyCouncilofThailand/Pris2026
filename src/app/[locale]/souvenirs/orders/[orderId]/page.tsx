import { notFound } from "next/navigation";
import { isMerchandiseId } from "@/lib/merchandiseRoutes";
import OrderScreen from "@/components/merchandise/OrderScreen";
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!isMerchandiseId(orderId)) notFound();
  return <OrderScreen orderId={orderId} />;
}
