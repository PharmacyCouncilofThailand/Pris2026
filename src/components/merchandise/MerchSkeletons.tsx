export function ProductGridSkeleton({
  count = 8,
  label = "กำลังโหลดสินค้า",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <>
      <p role="status" className="sr-only">
        {label}
      </p>
      <div className="merch-products merch-skeleton-grid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="merch-skeleton-card">
            <div className="merch-skeleton merch-skeleton-media" />
            <div className="merch-skeleton merch-skeleton-line" />
            <div className="merch-skeleton-buy">
              <div className="merch-skeleton merch-skeleton-price" />
              <div className="merch-skeleton merch-skeleton-round" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function CartSkeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        กำลังโหลดตะกร้า
      </p>
      <div className="merch-skeleton-panel" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="merch-skeleton-row">
            <div className="merch-skeleton merch-skeleton-thumb" />
            <div className="merch-skeleton-lines">
              <div className="merch-skeleton merch-skeleton-line" />
              <div className="merch-skeleton merch-skeleton-price" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function OrderCardSkeleton() {
  return (
    <>
      <p role="status" className="sr-only">
        กำลังโหลดคำสั่งซื้อ
      </p>
      <div
        className="merch-skeleton-panel merch-skeleton-order"
        aria-hidden="true"
      >
        <div className="merch-skeleton merch-skeleton-line" />
        <div className="merch-skeleton merch-skeleton-qr" />
        <div className="merch-skeleton merch-skeleton-price" />
      </div>
    </>
  );
}
