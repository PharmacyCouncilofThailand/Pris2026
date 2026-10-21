import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isMerchandiseId } from "@/lib/merchandiseRoutes";
import ProductDetailClient from "@/components/merchandise/ProductDetailClient";
export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  if (!isMerchandiseId(productId)) notFound();
  return <Suspense fallback={<p role="status">กำลังโหลดสินค้า</p>}><ProductDetailClient productId={productId} /></Suspense>;
}
