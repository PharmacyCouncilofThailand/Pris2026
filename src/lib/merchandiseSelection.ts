import type {
  BundleSelection,
  CartDto,
  CartLine,
  Minor,
  ProductDto,
  StoreDto,
  VariantDto,
} from "../types/merchandise";

export type Selection = {
  variantId: string | null;
  bundleSelections: BundleSelection[];
};

export function defaultSelection(p: ProductDto): Selection {
  if (p.kind === "single" && !p.hasOptions) {
    const v = p.variants.find((x) => x.saleEnabled);
    return { variantId: v?.id ?? null, bundleSelections: [] };
  }
  return { variantId: null, bundleSelections: [] };
}

export function selectionComplete(p: ProductDto, s: Selection): boolean {
  if (p.kind === "single") {
    return (
      s.bundleSelections.length === 0 &&
      p.variants.some((v) => v.id === s.variantId && v.saleEnabled)
    );
  }
  if (s.variantId !== null) return false;
  const selectable = p.components.filter((c) => c.mode === "selectable");
  const ids = new Set(selectable.map((c) => c.id));
  // Selections for fixed components are ignored (the server fills them in).
  const relevant = s.bundleSelections.filter((b) => ids.has(b.componentId));
  if (relevant.length !== selectable.length) return false;
  if (new Set(relevant.map((b) => b.componentId)).size !== selectable.length)
    return false;
  return selectable.every((c) => {
    const chosen = relevant.find((b) => b.componentId === c.id);
    return c.allowedVariants.some(
      (v) => v.id === chosen?.variantId && v.saleEnabled,
    );
  });
}

export function selectionPriceMinor(p: ProductDto, s: Selection): Minor | null {
  if (!selectionComplete(p, s)) return null;
  if (p.kind === "bundle") return p.price?.amountMinor ?? null;
  const v = p.variants.find((x) => x.id === s.variantId);
  return v?.priceMinor ?? p.price?.amountMinor ?? null;
}

export function parseQuantity(value: string): number | null {
  return /^[1-9][0-9]*$/.test(value) && Number.isSafeInteger(Number(value))
    ? Number(value)
    : null;
}

export function variantLabel(v: VariantDto | undefined | null): string {
  if (!v) return "";
  const parts: string[] = [];
  if (v.sizeTh) parts.push(`ไซซ์ ${v.sizeTh}`);
  if (v.colorTh) parts.push(`สี${v.colorTh}`);
  return parts.join(" / ");
}

export function describeLine(line: CartLine): string {
  const p = line.product;
  if (!p) return "";
  if (p.kind === "single") {
    return variantLabel(p.variants.find((v) => v.id === line.variantId));
  }
  return p.components
    .map((c) => {
      let variant: VariantDto | null | undefined = c.fixedVariant;
      if (c.mode === "selectable") {
        const chosen = line.bundleSelections.find(
          (b) => b.componentId === c.id,
        );
        variant = c.allowedVariants.find((v) => v.id === chosen?.variantId);
      }
      const opt = variantLabel(variant);
      return `${c.nameTh} × ${c.quantityPerBundle}${opt ? ` (${opt})` : ""}`;
    })
    .join(", ");
}

const storeText: Record<StoreDto["state"], string> = {
  not_open: "ยังไม่เปิดรับพรีออเดอร์",
  closed: "ปิดรับพรีออเดอร์แล้ว",
  disabled: "ร้านยังไม่เปิดให้บริการ",
  open: "ยังไม่เปิดรับพรีออเดอร์",
};

/** One Thai message per product `unavailableCodes` / cart `issueCodes` entry. */
export function unavailableMessage(
  code: string,
  storeState: StoreDto["state"],
): string {
  switch (code) {
    case "STORE_NOT_OPEN":
      return storeText[storeState];
    case "PRODUCT_DISABLED":
      return "สินค้านี้ปิดการขายชั่วคราว";
    case "VARIANT_DISABLED":
      return "ตัวเลือกนี้ปิดการขาย";
    case "COMPONENT_UNAVAILABLE":
      return "สินค้าในชุดบางรายการปิดการขาย";
    case "PRODUCT_MISSING":
      return "สินค้านี้ไม่มีแล้ว";
    default:
      return "สินค้านี้ไม่พร้อมขาย";
  }
}

/** Checkout needs an open store, a non-empty valid cart and server amounts. */
export function canCheckout(cart: CartDto, store: StoreDto): boolean {
  return (
    store.state === "open" &&
    cart.items.length > 0 &&
    cart.items.every((line) => line.valid) &&
    cart.amounts !== null
  );
}
