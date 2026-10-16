"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { formatBaht } from "@/lib/merchandiseFormat";

export function CheckoutBar({
  totalBaht,
  children,
}: {
  totalBaht: number | null;
  children: ReactNode;
}) {
  const bar = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = bar.current;
    if (!element) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--merch-host-bar-height",
        `${element.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--merch-host-bar-height");
    };
  }, []);
  return (
    <div className="merch-checkout-bar" ref={bar}>
      <p className="merch-checkout-bar-total">
        <span>รวมยอดสินค้า</span>{" "}
        <strong>{totalBaht === null ? "—" : formatBaht(totalBaht)}</strong>
      </p>
      {children}
    </div>
  );
}
