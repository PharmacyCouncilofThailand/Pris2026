"use client";
import { StoreHeaderTools } from "@conference/merchandise-storefront-view";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
export function MerchandiseHeaderTools({
  onLanguage,
  onMenu,
}: {
  onLanguage: () => void;
  onMenu: () => void;
}) {
  const { token, cart } = useMerchandise(),
    router = useRouter(),
    locale = useLocale();
  return (
    <StoreHeaderTools
      locale={locale === "th" ? "th" : "en"}
      cartCount={!token ? "0" : (cart.data?.unitCount ?? "—")}
      cartLabel="ตะกร้า"
      onCart={() =>
        router.push(
          token ? "/souvenirs/cart" : merchandiseLoginPath("/souvenirs/cart"),
        )
      }
      onLanguage={onLanguage}
      onMenu={onMenu}
    />
  );
}
