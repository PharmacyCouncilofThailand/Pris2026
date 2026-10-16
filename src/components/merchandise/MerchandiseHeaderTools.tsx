"use client";
import { StoreHeaderTools } from "./StoreHeaderTools";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";
import { useMerchandiseCart } from "./useMerchandiseCart";
import { merchandiseLoginPath } from "@/lib/merchandiseRoutes";
export function MerchandiseHeaderTools({
  onLanguage,
  onMenu,
}: {
  onLanguage: () => void;
  onMenu: () => void;
}) {
  const { token } = useMerchandise(),
    { units } = useMerchandiseCart(),
    router = useRouter(),
    locale = useLocale();
  return (
    <StoreHeaderTools
      locale={locale === "th" ? "th" : "en"}
      cartCount={!token ? "0" : units === null ? "—" : String(units)}
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
