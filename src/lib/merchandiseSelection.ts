import type { LineSelection, ProductDto, Variant } from "../types/merchandise";

export function initialSelection(product: ProductDto): LineSelection {
  const defaults = product.variants.filter(
    (v) => v.isDefault && v.saleEnabled && v.effectivePriceMinor !== null,
  );
  return {
    productId: product.id,
    variantId:
      product.kind === "single" &&
      product.optionMode === "none" &&
      defaults.length === 1
        ? defaults[0].id
        : null,
    bundleSelections:
      product.kind === "bundle"
        ? product.components
            .filter((c) => c.optionMode === "fixed" && c.fixedVariantId)
            .map((c) => ({ componentId: c.id, variantId: c.fixedVariantId! }))
        : [],
  };
}
export function selectionReady(
  product: ProductDto,
  selection: LineSelection,
): boolean {
  if (product.id !== selection.productId || !product.purchasable) return false;
  if (product.kind === "single")
    return (
      selection.bundleSelections.length === 0 &&
      product.variants.some(
        (v) =>
          v.id === selection.variantId &&
          v.saleEnabled &&
          v.effectivePriceMinor !== null,
      )
    );
  if (
    selection.variantId !== null ||
    selection.bundleSelections.length !== product.components.length ||
    product.components.length === 0
  )
    return false;
  if (
    new Set(selection.bundleSelections.map((c) => c.componentId)).size !==
    product.components.length
  )
    return false;
  return product.components.every((c) => {
    const chosen = selection.bundleSelections.find(
      (s) => s.componentId === c.id,
    );
    return (
      chosen !== undefined &&
      (c.optionMode === "fixed"
        ? chosen.variantId === c.fixedVariantId
        : c.allowedVariants.some(
            (v) => v.id === chosen.variantId && v.saleEnabled,
          ))
    );
  });
}
export function selectedPriceMinor(
  product: ProductDto,
  selection: LineSelection,
): string | null {
  if (
    product.kind === "bundle" &&
    product.id === selection.productId &&
    product.purchasable
  )
    return product.basePriceMinor;
  if (!selectionReady(product, selection)) return null;
  return product.kind === "bundle"
    ? product.basePriceMinor
    : product.variants.find((v) => v.id === selection.variantId)!
        .effectivePriceMinor;
}
export function parseQuantity(value: string): number | null {
  return /^[1-9][0-9]*$/.test(value) && Number.isSafeInteger(Number(value))
    ? Number(value)
    : null;
}
export function variantLabel(variant: Variant): string {
  return (
    [variant.colorTh, variant.sizeTh].filter(Boolean).join(" · ") ||
    "ไม่มีตัวเลือก"
  );
}
