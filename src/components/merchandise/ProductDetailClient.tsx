"use client";
import { useCallback } from "react";
import { Link } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseResource } from "./useMerchandiseResource";
import ProductDetail from "./ProductDetail";
export default function ProductDetailClient({
  productId,
}: {
  productId: string;
}) {
  const { api, eventCode, store } = useMerchandise();
  const load = useCallback(
    (signal: AbortSignal) => api.product(eventCode, productId, signal),
    [api, eventCode, productId],
  );
  const resource = useMerchandiseResource(`${eventCode}:${productId}`, load);
  const product = resource.data;
  const error = resource.error ?? store.error;
  if (error || !product || !store.data)
    return (
      <main className="merchandise-host-message">
        <Link href="/souvenirs">← กลับหน้าร้าน</Link>
        {error ? (
          <>
            <p role="alert">
              {error.status === 404 ? "ไม่พบสินค้าที่เปิดแสดง" : error.message}
            </p>
            <button
              className="merch-detail-retry"
              onClick={() => {
                resource.reload();
                store.reload();
              }}
            >
              ลองโหลดอีกครั้ง
            </button>
          </>
        ) : (
          <p role="status">กำลังโหลดสินค้า</p>
        )}
      </main>
    );
  return (
    <ProductDetail
      key={`${eventCode}:${product.id}`}
      product={product}
      store={store.data}
    />
  );
}
