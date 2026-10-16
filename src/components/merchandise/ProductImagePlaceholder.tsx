/* eslint-disable @next/next/no-img-element -- Static brand mark; same plain-img approach as the storefront media. */
export function ProductImagePlaceholder({
  failed = false,
}: {
  failed?: boolean;
}) {
  return (
    <span className="merch-image-placeholder">
      <img
        src="/assets/Img/logo/Logo-Final .png"
        alt=""
        aria-hidden="true"
        className="brightness-0"
      />
      <span className="sr-only merch-sr-only">
        {failed ? "โหลดรูปภาพไม่สำเร็จ" : "ยังไม่มีรูปสินค้า"}
      </span>
    </span>
  );
}
