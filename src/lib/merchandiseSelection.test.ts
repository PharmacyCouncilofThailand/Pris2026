import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultSelection,
  selectionComplete,
  selectionPriceBaht,
  describeLine,
  parseQuantity,
  unavailableMessage,
  canCheckout,
  optionImageId,
  optionValueImageId,
  leadImageFirst,
} from "./merchandiseSelection";
import type {
  CartDto,
  CartLine,
  ProductDto,
  StoreDto,
  VariantDto,
} from "../types/merchandise";

const v = (id: string, o: Partial<VariantDto> = {}): VariantDto => ({
  id,
  sizeTh: null,
  colorTh: null,
  priceBaht: null,
  saleEnabled: true,
  imageId: null,
  ...o,
});
const base: ProductDto = {
  id: "p",
  kind: "single",
  nameTh: "x",
  descriptionTh: null,
  sizeChartTh: null,
  images: [],
  categoryId: null,
  sortOrder: 0,
  hasOptions: false,
  variants: [],
  components: [],
  price: { kind: "exact", amountBaht: 100 },
  purchasable: true,
  unavailableCodes: [],
};
const bundle: ProductDto = {
  ...base,
  kind: "bundle",
  components: [
    {
      id: "c1",
      productId: "a",
      nameTh: "เสื้อ",
      quantityPerBundle: 1,
      mode: "selectable",
      fixedVariant: null,
      allowedVariants: [
        v("s", { sizeTh: "M", colorTh: "ขาว" }),
        v("t", { saleEnabled: false }),
      ],
    },
    {
      id: "c2",
      productId: "b",
      nameTh: "แก้ว",
      quantityPerBundle: 2,
      mode: "fixed",
      fixedVariant: v("f", { colorTh: "แดง" }),
      allowedVariants: [],
    },
  ],
};

test("no-option product defaults to first sellable variant", () => {
  const p = { ...base, variants: [v("a", { saleEnabled: false }), v("b")] };
  const s = defaultSelection(p);
  assert.equal(s.variantId, "b");
  assert.equal(selectionComplete(p, s), true);
});
test("product with options starts incomplete", () => {
  const p = { ...base, hasOptions: true, variants: [v("a")] };
  const s = defaultSelection(p);
  assert.equal(s.variantId, null);
  assert.equal(selectionComplete(p, s), false);
  assert.equal(
    selectionComplete(p, { variantId: "a", bundleSelections: [] }),
    true,
  );
});
test("bundle default is empty; complete with one selectable choice, fixed ignored", () => {
  const d = defaultSelection(bundle);
  assert.deepEqual(d, { variantId: null, bundleSelections: [] });
  assert.equal(selectionComplete(bundle, d), false);
  assert.equal(
    selectionComplete(bundle, {
      variantId: null,
      bundleSelections: [{ componentId: "c1", variantId: "s" }],
    }),
    true,
  );
  assert.equal(
    selectionComplete(bundle, {
      variantId: null,
      bundleSelections: [
        { componentId: "c1", variantId: "s" },
        { componentId: "c2", variantId: "f" },
      ],
    }),
    true,
  );
  assert.equal(
    selectionComplete(bundle, {
      variantId: null,
      bundleSelections: [{ componentId: "c1", variantId: "zz" }],
    }),
    false,
  );
  assert.equal(
    selectionComplete(bundle, {
      variantId: null,
      bundleSelections: [{ componentId: "c1", variantId: "t" }],
    }),
    false,
  );
});
test("price uses variant price then product price", () => {
  const p = {
    ...base,
    hasOptions: true,
    variants: [v("a", { priceBaht: 250 }), v("b")],
  };
  assert.equal(
    selectionPriceBaht(p, { variantId: "a", bundleSelections: [] }),
    250,
  );
  assert.equal(
    selectionPriceBaht(p, { variantId: "b", bundleSelections: [] }),
    100,
  );
  assert.equal(
    selectionPriceBaht(p, { variantId: null, bundleSelections: [] }),
    null,
  );
  assert.equal(
    selectionPriceBaht(bundle, {
      variantId: null,
      bundleSelections: [{ componentId: "c1", variantId: "s" }],
    }),
    100,
  );
});
const line = (
  product: ProductDto | null,
  o: Partial<CartLine> = {},
): CartLine => ({
  id: "l",
  productId: "p",
  variantId: null,
  bundleSelections: [],
  quantity: 1,
  product,
  unitPriceBaht: null,
  lineTotalBaht: null,
  valid: true,
  issueCodes: [],
  ...o,
});
test("describeLine", () => {
  const p = {
    ...base,
    hasOptions: true,
    variants: [
      v("a", { sizeTh: "M", colorTh: "ขาว" }),
      v("b", { sizeTh: "L" }),
      v("c"),
    ],
  };
  assert.equal(describeLine(line(p, { variantId: "a" })), "ไซซ์ M / สีขาว");
  assert.equal(describeLine(line(p, { variantId: "b" })), "ไซซ์ L");
  assert.equal(describeLine(line(p, { variantId: "c" })), "");
  assert.equal(describeLine(line(null)), "");
  assert.equal(
    describeLine(
      line(bundle, {
        bundleSelections: [{ componentId: "c1", variantId: "s" }],
      }),
    ),
    "เสื้อ × 1 (ไซซ์ M / สีขาว), แก้ว × 2 (สีแดง)",
  );
});
test("parseQuantity", () => {
  assert.equal(parseQuantity("3"), 3);
  assert.equal(parseQuantity("0"), null);
});

test("unavailableMessage maps product and cart issue codes to Thai copy", () => {
  assert.equal(
    unavailableMessage("STORE_NOT_OPEN", "not_open"),
    "ยังไม่เปิดรับพรีออเดอร์",
  );
  assert.equal(
    unavailableMessage("STORE_NOT_OPEN", "closed"),
    "ปิดรับพรีออเดอร์แล้ว",
  );
  assert.equal(
    unavailableMessage("STORE_NOT_OPEN", "disabled"),
    "ร้านยังไม่เปิดให้บริการ",
  );
  assert.equal(
    unavailableMessage("PRODUCT_DISABLED", "open"),
    "สินค้านี้ปิดการขายชั่วคราว",
  );
  assert.equal(
    unavailableMessage("VARIANT_DISABLED", "open"),
    "ตัวเลือกนี้ปิดการขาย",
  );
  assert.equal(
    unavailableMessage("COMPONENT_UNAVAILABLE", "open"),
    "สินค้าในชุดบางรายการปิดการขาย",
  );
  assert.equal(
    unavailableMessage("PRODUCT_MISSING", "open"),
    "สินค้านี้ไม่มีแล้ว",
  );
  assert.equal(
    unavailableMessage("SOMETHING_NEW", "open"),
    "สินค้านี้ไม่พร้อมขาย",
  );
});

test("canCheckout needs an open store, valid lines and server amounts", () => {
  const line = { id: "l", valid: true } as CartLine;
  const amounts = {
    subtotalBaht: 1,
    shippingBaht: 50,
    totalBaht: 51,
    currency: "THB",
  } as const;
  const cart = (items: CartLine[], a: CartDto["amounts"]) =>
    ({ items, amounts: a }) as CartDto;
  const store = (state: StoreDto["state"]) => ({ state }) as StoreDto;
  assert.equal(canCheckout(cart([line], amounts), store("open")), true);
  assert.equal(canCheckout(cart([line], amounts), store("closed")), false);
  assert.equal(canCheckout(cart([], null), store("open")), false);
  assert.equal(canCheckout(cart([line], null), store("open")), false);
  assert.equal(
    canCheckout(cart([{ ...line, valid: false }], amounts), store("open")),
    false,
  );
});

const shirt: VariantDto[] = [
  { id: "a", sizeTh: "S", colorTh: "ขาว", priceBaht: null, saleEnabled: true, imageId: null },
  { id: "b", sizeTh: "M", colorTh: "ขาว", priceBaht: null, saleEnabled: true, imageId: "w" },
  { id: "c", sizeTh: "S", colorTh: "ดำ", priceBaht: null, saleEnabled: false, imageId: "k" },
];
const mug: VariantDto[] = [
  { id: "x", sizeTh: "46Oz", colorTh: null, priceBaht: null, saleEnabled: true, imageId: "big" },
  { id: "y", sizeTh: "32Oz", colorTh: null, priceBaht: null, saleEnabled: true, imageId: null },
];

test("optionImageId follows the chosen option", () => {
  assert.equal(optionImageId(shirt, { colorTh: "ขาว", sizeTh: null }), "w");
  assert.equal(optionImageId(shirt, { colorTh: "ขาว", sizeTh: "S" }), null);
  assert.equal(optionImageId(shirt, { colorTh: "ดำ", sizeTh: null }), null);
  assert.equal(optionImageId(shirt, { colorTh: null, sizeTh: "M" }), null);
  assert.equal(optionImageId(mug, { colorTh: null, sizeTh: "46Oz" }), "big");
  assert.equal(optionImageId(mug, { colorTh: null, sizeTh: null }), null);
});

test("optionValueImageId gives colour thumbnails, and size thumbnails only without colours", () => {
  assert.equal(optionValueImageId(shirt, "colorTh", "ขาว"), "w");
  assert.equal(optionValueImageId(shirt, "colorTh", "ดำ"), "k");
  assert.equal(optionValueImageId(shirt, "sizeTh", "M"), null);
  assert.equal(optionValueImageId(mug, "sizeTh", "46Oz"), "big");
  assert.equal(optionValueImageId(mug, "sizeTh", "32Oz"), null);
});

test("leadImageFirst moves the lead image to the front only when present", () => {
  const imgs = ["p1", "p2", "p3"].map((id) => ({ id, url: `/${id}.png`, width: 1, height: 1 }));
  assert.deepEqual(leadImageFirst(imgs, "p3").map((i) => i.id), ["p3", "p1", "p2"]);
  assert.deepEqual(leadImageFirst(imgs, null).map((i) => i.id), ["p1", "p2", "p3"]);
  assert.deepEqual(leadImageFirst(imgs, "zz").map((i) => i.id), ["p1", "p2", "p3"]);
});
