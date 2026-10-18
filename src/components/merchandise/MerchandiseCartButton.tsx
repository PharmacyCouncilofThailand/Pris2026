"use client";
import { useRouter } from "@/i18n/routing";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
import { cn } from "@/lib/utils";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseCart } from "./useMerchandiseCart";
import { Icon } from "./storefront-icons";

// `tone` follows the site header: dark text on the light header at the top of
// the page, light text once the header turns black on scroll.
export function MerchandiseCartButton({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const { token } = useMerchandise(),
    { units } = useMerchandiseCart(),
    router = useRouter(),
    count = !token ? 0 : units,
    badge = count === null ? "—" : count > 99 ? "99+" : String(count);
  return (
    <button
      type="button"
      className={cn(
        "merch-header-cart relative inline-flex h-11 min-w-11 items-center justify-center rounded-full px-2.5 transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0055ff]",
        tone === "dark"
          ? "text-slate-900 hover:bg-slate-100"
          : "text-white hover:bg-white/10",
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
        className="merch-cart-badge absolute -right-1.5 -top-1.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#ff5800] px-1.5 text-[13px] font-extrabold leading-none text-[#10203d]"
        aria-hidden="true"
      >
        {badge}
      </span>
    </button>
  );
}
