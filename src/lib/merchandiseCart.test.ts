import test from "node:test";
import assert from "node:assert/strict";
import { cart, store, product, ids } from "../../tests/merchandise/data";
import {
  canCheckout,
  cartLineOptions,
  cartIssueMessage,
} from "./merchandiseCart";
test("checkout requires open store, nonempty valid server lines and authoritative totals", () => {
  const valid = {
    ...cart,
    items: [
      {
        id: ids.item,
        productId: product.id,
        variantId: ids.variant,
        bundleSelections: [],
        quantity: 2,
        product,
        unitPriceMinor: "10000",
        lineTotalMinor: "20000",
        valid: true,
        issueCodes: [],
      },
    ],
    amounts: {
      subtotalMinor: "20000",
      shippingMinor: "5000" as const,
      totalMinor: "25000",
      currency: "THB" as const,
    },
  };
  assert.equal(canCheckout(valid, store), true);
  assert.equal(canCheckout({ ...valid, amounts: null }, store), false);
  assert.equal(canCheckout({ ...valid, items: [] }, store), false);
  assert.equal(
    canCheckout(
      { ...valid, items: [{ ...valid.items[0], valid: false }] },
      store,
    ),
    false,
  );
  assert.equal(canCheckout(valid, { ...store, state: "closed" }), false);
  assert.equal(cartLineOptions(valid.items[0]), "ไม่มีตัวเลือก");
  assert.equal(
    cartLineOptions({ ...valid.items[0], product: null }),
    "ไม่สามารถโหลดตัวเลือกเดิมได้",
  );
});
test("availability messages describe the required recovery without pretending an unavailable price is zero", () => {
  assert.match(cartIssueMessage(["MERCH_BUNDLE_DEPENDENCY"]), /ส่วนประกอบ/);
  assert.match(cartIssueMessage(["MERCH_PREORDER_CLOSED"]), /ปิดรับ/);
  assert.match(cartIssueMessage(["MERCH_ITEM_UNAVAILABLE"]), /ตัวเลือก/);
  assert.match(cartIssueMessage(["UNKNOWN"]), /ตรวจสอบ/);
});
