"use client";
import { Icon } from "./storefront-icons";
export interface StoreHeaderToolsProps {
  cartCount: string;
  locale: "th" | "en";
  cartLabel: string;
  onCart(): void;
  onLanguage(): void;
  onMenu(): void;
}
export function StoreHeaderTools({
  cartCount,
  cartLabel,
  locale,
  onCart,
  onLanguage,
  onMenu,
}: StoreHeaderToolsProps) {
  const valid = /^(?:0|[1-9]\d*)$/.test(cartCount),
    badge = valid ? (BigInt(cartCount) > BigInt(99) ? "99+" : cartCount) : "—";
  return (
    <div className="merch-header-tools">
      <button
        type="button"
        onClick={onCart}
        className="merch-cart-tool"
        aria-label={`${cartLabel} ${valid ? cartCount : "กำลังตรวจสอบ"} รายการ`}
      >
        <Icon name="cart" />
        <span className="merch-cart-badge" aria-hidden="true">
          {badge}
        </span>
      </button>
      <span className="merch-tool-divider" aria-hidden="true" />
      <button
        type="button"
        onClick={onLanguage}
        aria-label={
          locale === "th"
            ? "เปลี่ยนภาษาเป็นภาษาอังกฤษ"
            : "เปลี่ยนภาษาเป็นภาษาไทย"
        }
      >
        <Icon name="globe" />
        <span>{locale === "th" ? "EN" : "TH"}</span>
      </button>
      <span className="merch-tool-divider" aria-hidden="true" />
      <button type="button" onClick={onMenu} aria-label="เปิดเมนู">
        <Icon name="menu" />
      </button>
    </div>
  );
}
