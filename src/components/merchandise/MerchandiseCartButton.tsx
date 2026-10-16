"use client";
import { useRouter } from "@/i18n/routing";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import { cn } from "@/lib/utils";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseCart } from "./useMerchandiseCart";
import { Icon } from "./storefront-icons";

export function MerchandiseCartButton({ className }: { className?: string }) {
  const { token } = useMerchandise(),
    { units } = useMerchandiseCart(),
    router = useRouter(),
    count = !token ? 0 : units,
    badge = count === null ? "—" : count > 99 ? "99+" : String(count);
  return (
    <button
      type="button"
      className={cn(
        "merch-header-cart relative inline-flex h-11 min-w-11 items-center justify-center rounded-full px-2.5 text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0055ff]",
        className,
      )}
      aria-label={`ตะกร้า ${count === null ? "กำลังตรวจสอบ" : count} รายการ`}
      onClick={() =>
        router.push(
          token ? "/souvenirs/cart" : merchandiseLoginPath("/souvenirs/cart"),
        )
      }
    >
      <Icon name="cart" className="h-[22px] w-[22px]" />
      <span
        className="merch-cart-badge absolute -right-0.5 -top-0.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-[#ff5800] px-1 text-[11px] font-extrabold leading-none text-[#10203d]"
        aria-hidden="true"
      >
        {badge}
      </span>
    </button>
  );
}
