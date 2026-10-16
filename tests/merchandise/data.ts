import type {
  OrderDetail,
  PaymentView,
  ProductDto,
  StoreDto,
  VariantDto,
} from "../../src/types/merchandise";

export const ids = {
  product: "10000000-0000-4000-8000-000000000001",
  variant: "10000000-0000-4000-8000-000000000002",
  order: "10000000-0000-4000-8000-000000000005",
  attempt: "10000000-0000-4000-8000-000000000006",
};
export const now = "2026-10-15T03:00:00.000Z";
export const futureIso = "2026-10-15T03:10:00.000Z";

// Synthetic EMVCo-shaped PromptPay string. Not a real payee or payment.
export const syntheticQrPayload =
  "00020101021229370016A000000677010111011300000000000005802TH530376454041.006304ABCD";

export function makeStore(o: Partial<StoreDto> = {}): StoreDto {
  return {
    eventId: 1,
    eventCode: "PRIS-2026",
    state: "open",
    opensAt: "2026-10-14T00:00:00.000Z",
    closesAt: "2026-10-30T00:00:00.000Z",
    productionInfoTh: null,
    shippingInfoTh: null,
    shippingBaht: 50,
    currency: "THB",
    serverNow: now,
    categories: [],
    banners: [],
    ...o,
  };
}

export function makeVariant(o: Partial<VariantDto> = {}): VariantDto {
  return {
    id: ids.variant,
    sizeTh: null,
    colorTh: null,
    priceBaht: 250,
    saleEnabled: true,
    ...o,
  };
}

export function makeSingle(o: Partial<ProductDto> = {}): ProductDto {
  return {
    id: ids.product,
    kind: "single",
    nameTh: "แก้วน้ำ Pris",
    descriptionTh: null,
    sizeChartTh: null,
    images: [],
    categoryId: null,
    sortOrder: 1,
    hasOptions: false,
    variants: [makeVariant()],
    components: [],
    price: { kind: "exact", amountBaht: 250 },
    purchasable: true,
    unavailableCodes: [],
    ...o,
  };
}

export function makeOptionsProduct(o: Partial<ProductDto> = {}): ProductDto {
  const v1 = makeVariant({
    id: "10000000-0000-4000-8000-000000000011",
    sizeTh: "M",
    colorTh: "ขาว",
    priceBaht: 300,
  });
  const v2 = makeVariant({
    id: "10000000-0000-4000-8000-000000000012",
    sizeTh: "L",
    colorTh: "ขาว",
    priceBaht: 320,
  });
  return makeSingle({
    id: "10000000-0000-4000-8000-000000000010",
    nameTh: "เสื้อยืด Pris",
    hasOptions: true,
    variants: [v1, v2],
    price: { kind: "from", amountBaht: 300 },
    ...o,
  });
}

export function makeBundle(o: Partial<ProductDto> = {}): ProductDto {
  const v = makeVariant({
    id: "10000000-0000-4000-8000-000000000021",
    sizeTh: "M",
    priceBaht: null,
  });
  const v2 = makeVariant({
    id: "10000000-0000-4000-8000-000000000022",
    sizeTh: "L",
    priceBaht: null,
  });
  return makeSingle({
    id: "10000000-0000-4000-8000-000000000020",
    kind: "bundle",
    nameTh: "ชุดของที่ระลึก",
    hasOptions: true,
    variants: [],
    components: [
      {
        id: "10000000-0000-4000-8000-000000000031",
        productId: ids.product,
        nameTh: "แก้วน้ำ Pris",
        quantityPerBundle: 1,
        mode: "fixed",
        fixedVariant: makeVariant(),
        allowedVariants: [],
      },
      {
        id: "10000000-0000-4000-8000-000000000032",
        productId: "10000000-0000-4000-8000-000000000010",
        nameTh: "เสื้อยืด Pris",
        quantityPerBundle: 1,
        mode: "selectable",
        fixedVariant: null,
        allowedVariants: [v, v2],
      },
    ],
    price: { kind: "exact", amountBaht: 450 },
    ...o,
  });
}

export function qrActive(o: Partial<PaymentView> = {}): PaymentView {
  return {
    state: "qr_active",
    attempt: {
      id: ids.attempt,
      referenceNo: "PRIS2026M000001",
      expiresAt: futureIso,
      qrPayload: syntheticQrPayload,
    },
    canRequestNewQr: false,
    canCheck: true,
    retryAfterSeconds: null,
    serverNow: now,
    ...o,
  };
}

export function makeOrder(o: Partial<OrderDetail> = {}): OrderDetail {
  return {
    id: ids.order,
    orderNumber: "PRIS2026-M-000001",
    createdAt: now,
    paymentStatus: "pending",
    paidAt: null,
    shipping: {
      status: "not_shipped",
      carrier: null,
      trackingId: null,
      shippedAt: null,
    },
    amounts: {
      subtotalBaht: 250,
      shippingBaht: 50,
      totalBaht: 300,
      currency: "THB",
    },
    buyer: {
      name: "ผู้ซื้อ สังเคราะห์",
      email: "buyer@example.test",
      phone: null,
    },
    recipient: {
      fullName: "ผู้ซื้อ สังเคราะห์",
      phone: "0812345678",
      addressLine: "1 ถนนทดสอบ",
      subdistrict: "ตำบลทดสอบ",
      district: "อำเภอทดสอบ",
      province: "กรุงเทพมหานคร",
      postalCode: "10100",
      company: null,
      deliveryNote: null,
    },
    items: [
      {
        id: "10000000-0000-4000-8000-000000000041",
        kind: "single",
        nameTh: "แก้วน้ำ Pris",
        sizeTh: null,
        colorTh: null,
        quantity: 1,
        unitPriceBaht: 250,
        lineTotalBaht: 250,
        components: [],
      },
    ],
    productionInfoTh: null,
    shippingInfoTh: null,
    payment: qrActive(),
    ...o,
  };
}

/** Deterministic valid UUIDs for bulk fixtures. */
export const uid = (n: number) =>
  `20000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
/** Serve a 1x1 PNG for the synthetic image host used by banner fixtures. */
export async function stubImages(
  context: import("@playwright/test").BrowserContext,
) {
  await context.route("https://img.example.test/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PIXEL }),
  );
}
export const image = (n: number) => ({
  id: uid(n),
  url: `https://img.example.test/${n}.png`,
  width: 640,
  height: 360,
});
