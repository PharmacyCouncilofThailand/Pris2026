// Buyer-facing DTOs copied verbatim from
// conference-api@25cd3fb src/modules/merchandise/types.ts
// Do not rename or reshape; if the API changes, copy again.
// Admin DTOs and MerchRouteOptions are intentionally not copied.
// Envelope/request types at the bottom are frontend-only additions.

export type Minor = number; // satang, integer
export interface ImageAsset { id: string; url: string; width: number; height: number }
export interface StoreDto {
  eventId: number; eventCode: string;
  state: "disabled" | "not_open" | "open" | "closed";
  opensAt: string | null; closesAt: string | null;
  productionInfoTh: string | null; shippingInfoTh: string | null;
  shippingMinor: 5000; currency: "THB"; serverNow: string;
  categories: { id: string; nameTh: string; sortOrder: number }[];
  banners: { id: string; image: ImageAsset; linkUrl: string | null }[];
}
export interface VariantDto {
  id: string; sizeTh: string | null; colorTh: string | null;
  priceMinor: Minor | null; saleEnabled: boolean;
}
export interface BundleComponentDto {
  id: string; productId: string; nameTh: string; quantityPerBundle: number;
  mode: "fixed" | "selectable"; fixedVariant: VariantDto | null; allowedVariants: VariantDto[];
}
export interface ProductDto {
  id: string; kind: "single" | "bundle"; nameTh: string;
  descriptionTh: string | null; sizeChartTh: string | null;
  images: ImageAsset[]; categoryId: string | null; sortOrder: number;
  hasOptions: boolean; // false = hide the option picker
  variants: VariantDto[]; components: BundleComponentDto[];
  price: { kind: "exact" | "from"; amountMinor: Minor } | null;
  purchasable: boolean; unavailableCodes: string[];
}
export interface BundleSelection { componentId: string; variantId: string }
export interface CartLine {
  id: string; productId: string; variantId: string | null; bundleSelections: BundleSelection[];
  quantity: number; product: ProductDto | null;
  unitPriceMinor: Minor | null; lineTotalMinor: Minor | null;
  valid: boolean; issueCodes: string[];
}
export interface Amounts { subtotalMinor: Minor; shippingMinor: 5000; totalMinor: Minor; currency: "THB" }
export interface CartDto {
  cartVersion: string; items: CartLine[]; amounts: Amounts | null;
  buyerDefaults: { fullName: string; phone: string | null; email: string };
  serverNow: string;
}
export interface Recipient {
  fullName: string; phone: string; addressLine: string; subdistrict: string;
  district: string; province: string; postalCode: string;
  company: string | null; deliveryNote: string | null;
}
export interface OrderItemDto {
  id: string; kind: "single" | "bundle"; nameTh: string; sizeTh: string | null; colorTh: string | null;
  quantity: number; unitPriceMinor: Minor; lineTotalMinor: Minor;
  components: { nameTh: string; sizeTh: string | null; colorTh: string | null; quantityPerBundle: number }[];
}
export interface OrderSummary {
  id: string; orderNumber: string; createdAt: string;
  paymentStatus: "pending" | "paid" | "expired"; paidAt: string | null;
  shipping: { status: "not_shipped" | "shipped"; carrier: string | null; trackingId: string | null; shippedAt: string | null };
  amounts: Amounts;
}

export type PaymentState =
  | "awaiting_qr"        // no usable QR and one can be requested
  | "qr_active"          // an unexpired QR exists
  | "verifying"          // expired less than 2 minutes ago
  | "qr_expired_open"    // QR expired, can request a new one
  | "qr_expired_closed"  // store closed, payment window over
  | "check_failed"       // latest inquiry failed
  | "review"             // attempt awaiting staff review, order not paid
  | "paid";
export interface PaymentView {
  state: PaymentState;
  attempt: { id: string; referenceNo: string; expiresAt: string | null; qrPayload: string | null } | null;
  canRequestNewQr: boolean;
  canCheck: boolean;
  retryAfterSeconds: number | null;
  serverNow: string;
}

export interface OrderDetail extends OrderSummary {
  buyer: { name: string; email: string; phone: string | null };
  recipient: Recipient; items: OrderItemDto[];
  productionInfoTh: string | null; shippingInfoTh: string | null;
  payment: PaymentView;
}

// ---- Frontend-only envelope and request types ----
export type ApiSuccess<T> = { success: true; data: T };
export interface ApiFailure {
  success: false;
  code: string;
  error: string;
  requestId: string;
  details?: Record<string, unknown>;
}
export interface Page<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export interface CreateOrderResult { order: OrderDetail; replayed: boolean }
export interface PaymentResult { payment: PaymentView }
export interface CartItemInput {
  productId: string;
  variantId: string | null;
  bundleSelections: BundleSelection[];
  quantity: number;
}
export interface CartItemPatch {
  quantity?: number;
  variantId?: string | null;
  bundleSelections?: BundleSelection[];
}
