"use client";
import { useMerchandise } from "./MerchandiseProvider";

/** The one shared cart: header badge, cart page and intent resume all read it. */
export function useMerchandiseCart() {
  const { cart, setCart } = useMerchandise();
  const units = cart.data
    ? cart.data.items.reduce((sum, line) => sum + line.quantity, 0)
    : null;
  return { cart, setCart, units };
}
