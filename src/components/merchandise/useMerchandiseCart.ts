"use client";
import { useMerchandise } from "./MerchandiseProvider";
export function useMerchandiseCart() {
  return useMerchandise().cart;
}
