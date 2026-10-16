"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { formatBaht } from "@/lib/merchandiseFormat";

export function CheckoutBar({
  totalBaht,
  label = "รวมยอดสินค้า",
  details,
  children,
}: {
  totalBaht: number | null;
  label?: string;
  details?: ReactNode;
  children: ReactNode;
}) {
  const bar = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = bar.current;
    if (!element) return;
    const root = document.documentElement;
    // Only the fixed phone bar needs bottom clearance; the panel scrolls with the page.
    const measure = () => {
      if (getComputedStyle(element).position === "fixed")
        root.style.setProperty(
          "--merch-host-bar-height",
          `${element.getBoundingClientRect().height}px`,
        );
      else root.style.removeProperty("--merch-host-bar-height");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      root.style.removeProperty("--merch-host-bar-height");
    };
  }, []);
  return (
    <div
      className={`merch-checkout-bar${details ? " merch-checkout-bar-has-details" : ""}`}
      ref={bar}
    >
      <p className="merch-checkout-bar-total">
        <span>{label}</span>{" "}
        <strong>{totalBaht === null ? "—" : formatBaht(totalBaht)}</strong>
      </p>
      {details && <div className="merch-checkout-bar-details">{details}</div>}
      {children}
    </div>
  );
}
