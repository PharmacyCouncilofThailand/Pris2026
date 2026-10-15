import type {
  Amounts,
  Recipient,
  ImageAsset,
  Category,
  Banner,
  StoreDto,
  Variant,
  BundleComponent,
  ProductDto,
  BundleSelection,
  CartLine,
  CartDto,
  SnapshotComponent,
  SnapshotItem,
  QuoteDto,
  RevisionSnapshot,
  PaymentAttemptDto,
  PaymentView,
  FulfillmentDto,
  OrderSummary,
  OrderDetail,
  ConfirmOrderResult,
  AttemptResult,
  PaymentCheckResult,
  OrderRequestDto,
  BuyerSnapshot,
  Page,
} from "../types/merchandise";
import { isIsoUtc, isMinor } from "./merchandiseFormat";
export type Check = (value: unknown) => boolean;
export const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text: Check = (v) => typeof v === "string";
const boolean: Check = (v) => typeof v === "boolean";
const integer: Check = (v) => typeof v === "number" && Number.isSafeInteger(v);
const natural: Check = (v) => integer(v) && (v as number) >= 0;
const positive: Check = (v) => integer(v) && (v as number) > 0;
export const uuid: Check = (v) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const count: Check = (v) =>
  typeof v === "string" && /^(0|[1-9][0-9]*)$/.test(v);
const one =
  (...values: unknown[]): Check =>
  (v) =>
    values.includes(v);
const nullable =
  (check: Check): Check =>
  (v) =>
    v === null || check(v);
const list =
  (check: Check): Check =>
  (v) =>
    Array.isArray(v) && v.every(check);
// Canonical keys are compile-checked against each DTO; unknown fields are rejected.
function shape<T>(fields: { [K in keyof T]-?: Check }): Check {
  const keys = Object.keys(fields);
  return (value) =>
    record(value) &&
    Object.keys(value).length === keys.length &&
    Object.entries(fields).every(
      ([key, check]) =>
        Object.prototype.hasOwnProperty.call(value, key) &&
        (check as Check)(value[key]),
    );
}
const url: Check = (v) => {
  if (
    typeof v !== "string" ||
    /[\\\u0000-\u0020]/.test(v) ||
    v.startsWith("//")
  )
    return false;
  try {
    const parsed = new URL(v, "https://merchandise.example.test");
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password &&
      (v.startsWith("/") || /^https?:\/\//.test(v))
    );
  } catch {
    return false;
  }
};
const image = shape<ImageAsset>({
  id: uuid,
  url,
  altTh: text,
  width: positive,
  height: positive,
});
const category = shape<Category>({
  id: uuid,
  eventId: positive,
  nameTh: text,
  sortOrder: integer,
  visible: boolean,
  version: natural,
});
const banner = shape<Banner>({
  id: uuid,
  eventId: positive,
  image,
  mobileImage: nullable(image),
  destination: nullable(
    (v) =>
      typeof v === "string" &&
      v.startsWith("/") &&
      !v.startsWith("//") &&
      !/[\\\u0000-\u0020]/.test(v),
  ),
  active: boolean,
  sortOrder: integer,
  version: natural,
});
export const storeResponse = shape<StoreDto>({
  eventId: positive,
  eventCode: (v) => typeof v === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(v),
  state: one("unconfigured", "disabled", "not_open", "open", "closed"),
  enabled: boolean,
  preorderOpensAt: nullable(isIsoUtc),
  preorderClosesAt: nullable(isIsoUtc),
  productionInfoTh: nullable(text),
  shippingInfoTh: nullable(text),
  version: natural,
  serverNow: isIsoUtc,
  shippingMinor: one("5000"),
  currency: one("THB"),
  categories: list(category),
  banners: list(banner),
});
const variant = shape<Variant>({
  id: uuid,
  productId: uuid,
  sizeTh: nullable(text),
  colorTh: nullable(text),
  isDefault: boolean,
  saleEnabled: boolean,
  version: natural,
  priceOverrideMinor: nullable(isMinor),
  effectivePriceMinor: nullable(isMinor),
});
const component = shape<BundleComponent>({
  id: uuid,
  productId: uuid,
  nameTh: text,
  quantityPerBundle: positive,
  optionMode: one("fixed", "selectable"),
  fixedVariantId: nullable(uuid),
  allowedVariants: list(variant),
});
const price = shape<{ kind: "exact" | "from"; amountMinor: string }>({
  kind: one("exact", "from"),
  amountMinor: isMinor,
});
const productShape = shape<ProductDto>({
  id: uuid,
  eventId: positive,
  kind: one("single", "bundle"),
  nameTh: text,
  descriptionTh: nullable(text),
  sizeInfoTh: nullable(text),
  images: list(image),
  categoryId: nullable(uuid),
  sortOrder: integer,
  publishState: one("published"),
  saleEnabled: boolean,
  version: natural,
  optionMode: one("none", "size", "color", "size_color"),
  basePriceMinor: nullable(isMinor),
  variants: list(variant),
  components: list(component),
  price: nullable(price),
  purchasable: boolean,
  unavailableCodes: list(text),
});
export const productResponse: Check = (value) => {
  if (!productShape(value)) return false;
  const data = value as ProductDto;
  return (
    data.variants.every((v) => v.productId === data.id) &&
    data.components.every((c) =>
      c.allowedVariants.every((v) => v.productId === c.productId),
    )
  );
};
const amountsShape = shape<Amounts>({
  subtotalMinor: isMinor,
  shippingMinor: one("5000"),
  totalMinor: isMinor,
  currency: one("THB"),
});
const amounts: Check = (v) =>
  amountsShape(v) &&
  record(v) &&
  BigInt(v.subtotalMinor as string) + BigInt(5000) ===
    BigInt(v.totalMinor as string);
const recipient = shape<Recipient>({
  fullName: text,
  phone: text,
  addressLine: text,
  subdistrict: text,
  district: text,
  province: text,
  postalCode: (v) => typeof v === "string" && /^[0-9]{5}$/.test(v),
  country: one("TH"),
  company: nullable(text),
  deliveryNote: nullable(text),
});
const selection = shape<BundleSelection>({
  componentId: uuid,
  variantId: uuid,
});
const cartLine = shape<CartLine>({
  id: uuid,
  productId: uuid,
  variantId: nullable(uuid),
  bundleSelections: list(selection),
  quantity: positive,
  product: nullable(productResponse),
  unitPriceMinor: nullable(isMinor),
  lineTotalMinor: nullable(isMinor),
  valid: boolean,
  issueCodes: list(text),
});
const cartShape = shape<CartDto>({
  id: nullable(uuid),
  eventId: positive,
  revision: natural,
  items: list(cartLine),
  unitCount: count,
  amounts: nullable(amounts),
  serverNow: isIsoUtc,
});
export const cartResponse: Check = (v) => {
  if (!cartShape(v)) return false;
  const data = v as CartDto;
  return (
    data.items
      .reduce((sum, line) => sum + BigInt(line.quantity), BigInt(0))
      .toString() === data.unitCount &&
    data.items.every(
      (line) =>
        (!line.product ||
          (line.product.eventId === data.eventId &&
            line.product.id === line.productId)) &&
        (!line.valid ||
          (line.product !== null &&
            line.unitPriceMinor !== null &&
            line.lineTotalMinor !== null)),
    )
  );
};
const snapshotComponent = shape<SnapshotComponent>({
  productId: uuid,
  variantId: uuid,
  nameTh: text,
  sizeTh: nullable(text),
  colorTh: nullable(text),
  quantityPerBundle: positive,
});
const snapshotItem = shape<SnapshotItem>({
  id: uuid,
  productId: uuid,
  variantId: nullable(uuid),
  kind: one("single", "bundle"),
  nameTh: text,
  sizeTh: nullable(text),
  colorTh: nullable(text),
  quantity: positive,
  unitPriceMinor: isMinor,
  lineTotalMinor: isMinor,
  components: list(snapshotComponent),
});
export const quoteResponse = shape<QuoteDto>({
  quoteToken: text,
  cartRevision: natural,
  items: list(snapshotItem),
  amounts,
  recipient,
  storeVersion: natural,
  serverNow: isIsoUtc,
  productionInfoTh: nullable(text),
  shippingInfoTh: nullable(text),
});
const revision = shape<RevisionSnapshot>({
  revision: positive,
  kind: one("original", "amendment"),
  recipient,
  items: list(snapshotItem),
  createdAt: isIsoUtc,
});
const attempt = shape<PaymentAttemptDto>({
  id: uuid,
  orderId: uuid,
  referenceNo: text,
  orderNo: nullable(text),
  transactionId: nullable(text),
  creationStatus: one("creating", "issued", "failed", "unknown"),
  verificationStatus: one(
    "not_checked",
    "checking",
    "verified_unpaid",
    "verified_paid",
    "unknown",
    "review_required",
  ),
  providerCreatedAt: nullable(isIsoUtc),
  expiresAt: nullable(isIsoUtc),
  verifiedAt: nullable(isIsoUtc),
  qrAvailable: boolean,
});
const payment = shape<PaymentView>({
  state: one(
    "not_created",
    "creating",
    "qr_active",
    "checking",
    "qr_expired_open",
    "qr_expired_closed",
    "verification_unknown",
    "qr_expired_unavailable",
    "review_required",
    "paid",
  ),
  attempt: nullable(attempt),
  canRequestNewQr: boolean,
  canCheck: boolean,
  serverNow: isIsoUtc,
  messageCode: nullable(text),
});
const fulfillment = shape<FulfillmentDto>({
  status: one("not_shipped", "shipped"),
  carrier: nullable(text),
  trackingId: nullable(text),
  shippedAt: nullable(isIsoUtc),
  version: natural,
});
const summaryFields: { [K in keyof OrderSummary]: Check } = {
  id: uuid,
  orderNumber: text,
  eventId: positive,
  createdAt: isIsoUtc,
  paymentStatus: one("pending", "paid"),
  paidAt: nullable(isIsoUtc),
  fulfillment,
  amounts,
  effectiveRevision: positive,
};
export const orderSummaryResponse = shape<OrderSummary>(summaryFields);
const buyer = shape<BuyerSnapshot>({
  id: positive,
  name: text,
  email: text,
  phone: nullable(text),
});
const orderShape = shape<OrderDetail>({
  ...summaryFields,
  buyer,
  original: revision,
  effective: revision,
  payment,
});
export const orderResponse: Check = (v) => {
  if (!orderShape(v)) return false;
  const data = v as OrderDetail;
  return (
    data.effectiveRevision === data.effective.revision &&
    (data.paymentStatus === "paid"
      ? data.paidAt !== null &&
        data.payment.state === "paid" &&
        !data.payment.canRequestNewQr
      : data.paidAt === null && data.payment.state !== "paid") &&
    (!data.payment.attempt || data.payment.attempt.orderId === data.id)
  );
};
export const confirmResponse = shape<ConfirmOrderResult>({
  order: orderResponse,
  replayed: boolean,
});
export const attemptResponse = shape<AttemptResult>({
  orderId: uuid,
  payment,
  replayed: boolean,
});
export const checkResponse = shape<PaymentCheckResult>({
  orderId: uuid,
  payment,
  coalesced: boolean,
});
export const requestResponse = shape<OrderRequestDto>({
  state: one("not_found", "processing", "completed", "failed"),
  orderId: nullable(uuid),
  error: nullable(
    shape<{ code: string; message: string }>({ code: text, message: text }),
  ),
  serverNow: isIsoUtc,
});
export function pageResponse(item: Check): Check {
  return shape<Page<unknown>>({
    items: list(item),
    pagination: shape<Page<unknown>["pagination"]>({
      page: positive,
      limit: positive,
      total: natural,
      totalPages: natural,
    }),
  });
}
