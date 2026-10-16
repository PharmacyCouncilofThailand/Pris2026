import type {
  Amounts,
  BundleComponentDto,
  BundleSelection,
  CartDto,
  CartLine,
  CreateOrderResult,
  ImageAsset,
  OrderDetail,
  OrderItemDto,
  OrderSummary,
  Page,
  PaymentResult,
  PaymentView,
  ProductDto,
  Recipient,
  StoreDto,
  VariantDto,
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
// Canonical keys are compile-checked against each DTO. Fields the API adds
// later are accepted; missing or malformed known fields are rejected.
function shape<T>(fields: { [K in keyof T]-?: Check }): Check {
  return (value) =>
    record(value) &&
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
  width: positive,
  height: positive,
});
export const storeResponse = shape<StoreDto>({
  eventId: positive,
  eventCode: (v) => typeof v === "string" && /^[A-Za-z0-9_-]{1,50}$/.test(v),
  state: one("disabled", "not_open", "open", "closed"),
  opensAt: nullable(isIsoUtc),
  closesAt: nullable(isIsoUtc),
  productionInfoTh: nullable(text),
  shippingInfoTh: nullable(text),
  shippingMinor: one(5000),
  currency: one("THB"),
  serverNow: isIsoUtc,
  categories: list(
    shape<StoreDto["categories"][number]>({
      id: uuid,
      nameTh: text,
      sortOrder: integer,
    }),
  ),
  banners: list(
    shape<StoreDto["banners"][number]>({
      id: uuid,
      image,
      linkUrl: nullable(url),
    }),
  ),
});
const variant = shape<VariantDto>({
  id: uuid,
  sizeTh: nullable(text),
  colorTh: nullable(text),
  priceMinor: nullable(isMinor),
  saleEnabled: boolean,
});
const component = shape<BundleComponentDto>({
  id: uuid,
  productId: uuid,
  nameTh: text,
  quantityPerBundle: positive,
  mode: one("fixed", "selectable"),
  fixedVariant: nullable(variant),
  allowedVariants: list(variant),
});
export const productResponse = shape<ProductDto>({
  id: uuid,
  kind: one("single", "bundle"),
  nameTh: text,
  descriptionTh: nullable(text),
  sizeChartTh: nullable(text),
  images: list(image),
  categoryId: nullable(uuid),
  sortOrder: integer,
  hasOptions: boolean,
  variants: list(variant),
  components: list(component),
  price: nullable(
    shape<NonNullable<ProductDto["price"]>>({
      kind: one("exact", "from"),
      amountMinor: isMinor,
    }),
  ),
  purchasable: boolean,
  unavailableCodes: list(text),
});
const amounts = shape<Amounts>({
  subtotalMinor: isMinor,
  shippingMinor: one(5000),
  totalMinor: isMinor,
  currency: one("THB"),
});
const recipient = shape<Recipient>({
  fullName: text,
  phone: text,
  addressLine: text,
  subdistrict: text,
  district: text,
  province: text,
  postalCode: text,
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
export const cartResponse = shape<CartDto>({
  cartVersion: text,
  items: list(cartLine),
  amounts: nullable(amounts),
  buyerDefaults: shape<CartDto["buyerDefaults"]>({
    fullName: text,
    phone: nullable(text),
    email: text,
  }),
  serverNow: isIsoUtc,
});
const orderItem = shape<OrderItemDto>({
  id: uuid,
  kind: one("single", "bundle"),
  nameTh: text,
  sizeTh: nullable(text),
  colorTh: nullable(text),
  quantity: positive,
  unitPriceMinor: isMinor,
  lineTotalMinor: isMinor,
  components: list(
    shape<OrderItemDto["components"][number]>({
      nameTh: text,
      sizeTh: nullable(text),
      colorTh: nullable(text),
      quantityPerBundle: positive,
    }),
  ),
});
const payment: Check = (v) => {
  const base = shape<PaymentView>({
    state: one(
      "awaiting_qr",
      "qr_active",
      "verifying",
      "qr_expired_open",
      "qr_expired_closed",
      "check_failed",
      "review",
      "paid",
    ),
    attempt: nullable(
      shape<NonNullable<PaymentView["attempt"]>>({
        id: uuid,
        referenceNo: text,
        expiresAt: nullable(isIsoUtc),
        qrPayload: nullable(text),
      }),
    ),
    canRequestNewQr: boolean,
    canCheck: boolean,
    retryAfterSeconds: nullable(natural),
    serverNow: isIsoUtc,
  });
  if (!base(v)) return false;
  const data = v as PaymentView;
  // qr_active needs an attempt, but its payload may be null/empty when the
  // server could not decrypt it; the panel then offers a status check instead.
  return data.state !== "qr_active" || data.attempt !== null;
};
export const paymentResponse = shape<PaymentResult>({ payment });
const summaryFields: { [K in keyof OrderSummary]: Check } = {
  id: uuid,
  orderNumber: text,
  createdAt: isIsoUtc,
  paymentStatus: one("pending", "paid", "expired"),
  paidAt: nullable(isIsoUtc),
  shipping: shape<OrderSummary["shipping"]>({
    status: one("not_shipped", "shipped"),
    carrier: nullable(text),
    trackingId: nullable(text),
    shippedAt: nullable(isIsoUtc),
  }),
  amounts,
};
export const orderSummaryResponse = shape<OrderSummary>(summaryFields);
export const orderResponse = shape<OrderDetail>({
  ...summaryFields,
  buyer: shape<OrderDetail["buyer"]>({
    name: text,
    email: text,
    phone: nullable(text),
  }),
  recipient,
  items: list(orderItem),
  productionInfoTh: nullable(text),
  shippingInfoTh: nullable(text),
  payment,
});
export const createOrderResponse = shape<CreateOrderResult>({
  order: orderResponse,
  replayed: boolean,
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
