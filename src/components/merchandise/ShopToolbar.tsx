"use client";
import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { useMerchandise } from "./MerchandiseProvider";

export function ShopToolbar({ start }: { start?: ReactNode }) {
  const { token } = useMerchandise();
  if (!start && !token) return null;
  return (
    <div className="merch-shop-toolbar">
      <div>{start}</div>
      {token && (
        <Link href="/souvenirs/orders" className="merch-my-orders">
          คำสั่งซื้อของฉัน
        </Link>
      )}
    </div>
  );
}
