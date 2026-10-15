import test from "node:test";
import assert from "node:assert/strict";
import { product, ids } from "../../tests/merchandise/data";
import type { ProductDto } from "../types/merchandise";
import {
  initialSelection,
  selectionReady,
  selectedPriceMinor,
  parseQuantity,
} from "./merchandiseSelection";

test("no-option products use their actual default without inventing choices", () => {
  const selection = initialSelection(product);
  assert.equal(selection.variantId, product.variants[0].id);
  assert.equal(selectionReady(product, selection), true);
  assert.equal(
    selectedPriceMinor(product, selection),
    product.variants[0].effectivePriceMinor,
  );
  assert.equal(
    selectionReady({ ...product, purchasable: false }, selection),
    false,
  );
});
test("explicit variants require a real enabled combination and its exact price, including zero", () => {
  const p: ProductDto = {
    ...product,
    optionMode: "size_color",
    variants: [
      {
        ...product.variants[0],
        isDefault: false,
        sizeTh: "M",
        colorTh: "น้ำเงิน",
        effectivePriceMinor: "0",
      },
      {
        ...product.variants[0],
        id: ids.item,
        isDefault: false,
        sizeTh: "L",
        colorTh: "ส้ม",
        saleEnabled: false,
      },
    ],
  };
  assert.equal(initialSelection(p).variantId, null);
  assert.equal(selectionReady(p, initialSelection(p)), false);
  assert.equal(
    selectedPriceMinor(p, {
      ...initialSelection(p),
      variantId: p.variants[0].id,
    }),
    "0",
  );
  assert.equal(
    selectionReady(p, { ...initialSelection(p), variantId: ids.item }),
    false,
  );
  assert.equal(
    selectionReady(p, { ...initialSelection(p), variantId: ids.order }),
    false,
  );
});
test("bundles require each actual component exactly once and charge only the set price", () => {
  const p: ProductDto = {
    ...product,
    kind: "bundle",
    basePriceMinor: "22000",
    components: [
      {
        id: ids.item,
        productId: ids.product,
        nameTh: "ชิ้นทดสอบ",
        quantityPerBundle: 2,
        optionMode: "fixed",
        fixedVariantId: ids.variant,
        allowedVariants: product.variants,
      },
      {
        id: ids.order,
        productId: ids.product,
        nameTh: "เลือกชิ้นทดสอบ",
        quantityPerBundle: 1,
        optionMode: "selectable",
        fixedVariantId: null,
        allowedVariants: product.variants,
      },
    ],
  };
  const initial = initialSelection(p);
  assert.equal(initial.bundleSelections.length, 1);
  assert.equal(selectionReady(p, initial), false);
  const selection = {
    ...initial,
    bundleSelections: [
      ...initial.bundleSelections,
      { componentId: ids.order, variantId: ids.variant },
    ],
  };
  assert.equal(selectedPriceMinor(p, selection), "22000");
  assert.equal(
    selectionReady(p, {
      ...selection,
      bundleSelections: [
        selection.bundleSelections[0],
        selection.bundleSelections[0],
      ],
    }),
    false,
  );
  assert.equal(selectionReady({ ...p, purchasable: false }, selection), false);
});
test("quantity permits positive safe integers without an arbitrary purchase cap", () => {
  for (const input of ["1", "1000000", String(Number.MAX_SAFE_INTEGER)])
    assert.equal(parseQuantity(input), Number(input));
  for (const input of ["", "0", "-1", "1.2", "1e3", " 2 ", "9007199254740992"])
    assert.equal(parseQuantity(input), null);
});
