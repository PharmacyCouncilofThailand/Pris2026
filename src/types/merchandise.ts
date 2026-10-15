// Copied from conference-api canonical merchandise 1.0.0; SHA256 178715e919d427c60af00a592e16821fbe8a56e9f841852e5fd24779bf09afe3. Do not format.
// Canonical merchandise v1 contract; source: shared implementation plan, 14 October 2026.
export type Id = string;
export type Minor = string; // validated unsigned decimal integer, <= 30 digits
export type IsoUtc = string; // serialized UTC ISO 8601 ending Z
export type EventCode = string;
export type PaymentStatus = "pending" | "paid";
export type ShippingStatus = "not_shipped" | "shipped";
export type CreationStatus = "creating" | "issued" | "failed" | "unknown";
export type VerificationStatus =
  | "not_checked" | "checking" | "verified_unpaid"
  | "verified_paid" | "unknown" | "review_required";
export type StoreState = "unconfigured" | "disabled" | "not_open" | "open" | "closed";
export type PublishState = "draft" | "published";
export type ProductKind = "single" | "bundle";
export type OptionMode = "none" | "size" | "color" | "size_color";

export interface Page<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export interface ApiSuccess<T> { success: true; data: T }
export interface ApiFailure {
  success: false;
  code: string;
  error: string;
  requestId: string;
  details?: { fieldErrors?: Record<string, string[]>; resourceVersion?: number };
}
export interface Amounts {
  subtotalMinor: Minor;
  shippingMinor: "5000";
  totalMinor: Minor;
  currency: "THB";
}
export interface Recipient {
  fullName: string;
  phone: string;
  addressLine: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: "TH";
  company: string | null;
  deliveryNote: string | null;
}
export interface BuyerSnapshot {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}
export interface ImageAsset {
  id: Id;
  url: string;
  altTh: string;
  width: number;
  height: number;
}
export interface Category {
  id: Id; eventId: number; nameTh: string; sortOrder: number;
  visible: boolean; version: number;
}
export interface Banner {
  id: Id; eventId: number; image: ImageAsset;
  mobileImage: ImageAsset | null;
  destination: string | null;
  active: boolean; sortOrder: number; version: number;
}
export interface StoreDto {
  eventId: number; eventCode: EventCode; state: StoreState; enabled: boolean;
  preorderOpensAt: IsoUtc | null; preorderClosesAt: IsoUtc | null;
  productionInfoTh: string | null; shippingInfoTh: string | null;
  version: number; serverNow: IsoUtc;
  shippingMinor: "5000"; currency: "THB";
  categories: Category[]; banners: Banner[];
}
export interface Variant {
  id: Id; productId: Id; sizeTh: string | null; colorTh: string | null;
  isDefault: boolean; saleEnabled: boolean; version: number;
  priceOverrideMinor: Minor | null;
  effectivePriceMinor: Minor | null;
}
export interface BundleComponent {
  id: Id; productId: Id; nameTh: string; quantityPerBundle: number;
  optionMode: "fixed" | "selectable";
  fixedVariantId: Id | null; allowedVariants: Variant[];
}
export interface ProductDto {
  id: Id; eventId: number; kind: ProductKind; nameTh: string;
  descriptionTh: string | null; sizeInfoTh: string | null;
  images: ImageAsset[]; categoryId: Id | null; sortOrder: number;
  publishState: PublishState; saleEnabled: boolean; version: number;
  optionMode: OptionMode; basePriceMinor: Minor | null;
  variants: Variant[]; components: BundleComponent[];
  price: { kind: "exact" | "from"; amountMinor: Minor } | null;
  purchasable: boolean; unavailableCodes: string[];
}
export interface BundleSelection { componentId: Id; variantId: Id }
export interface LineSelection {
  productId: Id;
  variantId: Id | null;
  bundleSelections: BundleSelection[];
}
export interface CartLine extends LineSelection {
  id: Id; quantity: number;
  product: ProductDto | null;
  unitPriceMinor: Minor | null; lineTotalMinor: Minor | null;
  valid: boolean; issueCodes: string[];
}
export interface CartDto {
  id: Id | null; eventId: number; revision: number;
  items: CartLine[]; unitCount: string;
  amounts: Amounts | null; serverNow: IsoUtc;
}
export interface CartAddInput extends LineSelection {
  quantity: number; expectedRevision: number;
}
export interface CartUpdateInput {
  quantity: number; variantId: Id | null;
  bundleSelections: BundleSelection[]; expectedRevision: number;
}
export interface QuoteInput { expectedCartRevision: number; recipient: Recipient }
export interface SnapshotComponent {
  productId: Id; variantId: Id; nameTh: string;
  sizeTh: string | null; colorTh: string | null;
  quantityPerBundle: number;
}
export interface SnapshotItem {
  id: Id; productId: Id; variantId: Id | null;
  kind: ProductKind; nameTh: string;
  sizeTh: string | null; colorTh: string | null;
  quantity: number; unitPriceMinor: Minor; lineTotalMinor: Minor;
  components: SnapshotComponent[];
}
export interface QuoteDto {
  quoteToken: string; cartRevision: number;
  items: SnapshotItem[]; amounts: Amounts; recipient: Recipient;
  storeVersion: number; serverNow: IsoUtc;
  productionInfoTh: string | null; shippingInfoTh: string | null;
}
export interface ConfirmOrderInput {
  quoteToken: string; expectedCartRevision: number; recipient: Recipient;
}
export interface RevisionSnapshot {
  revision: number; kind: "original" | "amendment";
  recipient: Recipient; items: SnapshotItem[]; createdAt: IsoUtc;
}
export type PaymentUiState =
  | "not_created" | "creating" | "qr_active" | "checking"
  | "qr_expired_open" | "qr_expired_closed" | "verification_unknown"
  | "qr_expired_unavailable"
  | "review_required" | "paid";
export interface PaymentAttemptDto {
  id: Id; orderId: Id;
  referenceNo: string; orderNo: string | null; transactionId: string | null;
  creationStatus: CreationStatus; verificationStatus: VerificationStatus;
  providerCreatedAt: IsoUtc | null; expiresAt: IsoUtc | null;
  verifiedAt: IsoUtc | null; qrAvailable: boolean;
}
export interface PaymentView {
  state: PaymentUiState;
  attempt: PaymentAttemptDto | null;
  canRequestNewQr: boolean; canCheck: boolean;
  serverNow: IsoUtc; messageCode: string | null;
}
export interface FulfillmentDto {
  status: ShippingStatus; carrier: string | null; trackingId: string | null;
  shippedAt: IsoUtc | null; version: number;
}
export interface OrderSummary {
  id: Id; orderNumber: string; eventId: number; createdAt: IsoUtc;
  paymentStatus: PaymentStatus; paidAt: IsoUtc | null;
  fulfillment: FulfillmentDto; amounts: Amounts; effectiveRevision: number;
}
export interface OrderDetail extends OrderSummary {
  buyer: BuyerSnapshot; original: RevisionSnapshot; effective: RevisionSnapshot;
  payment: PaymentView;
}
export interface ConfirmOrderResult { order: OrderDetail; replayed: boolean }
export interface AttemptInput { expectedOrderRevision: number }
export interface AttemptResult { orderId: Id; payment: PaymentView; replayed: boolean }
export interface PaymentCheckResult { orderId: Id; payment: PaymentView; coalesced: boolean }
export interface OrderRequestDto {
  state: "not_found" | "processing" | "completed" | "failed";
  orderId: Id | null;
  error: { code: string; message: string } | null;
  serverNow: IsoUtc;
}

export interface StoreUpdateInput {
  expectedVersion: number; enabled: boolean;
  preorderOpensAt: IsoUtc | null; preorderClosesAt: IsoUtc | null;
  productionInfoTh: string | null; shippingInfoTh: string | null;
}
export interface ProductWriteInput {
  expectedVersion?: number; kind: ProductKind; nameTh: string;
  descriptionTh: string | null; sizeInfoTh: string | null;
  imageIds: Id[]; categoryId: Id | null; sortOrder: number;
  optionMode: OptionMode; basePriceMinor: Minor | null;
}
export interface VariantWriteInput {
  id?: Id; sizeTh: string | null; colorTh: string | null;
  isDefault: boolean; saleEnabled: boolean; priceOverrideMinor: Minor | null;
}
export interface VariantSetInput {
  expectedVersion: number; variants: VariantWriteInput[];
}
export interface ComponentWriteInput {
  id?: Id; productId: Id; quantityPerBundle: number;
  optionMode: "fixed" | "selectable";
  fixedVariantId: Id | null; allowedVariantIds: Id[]; sortOrder: number;
}
export interface BundleSetInput {
  expectedVersion: number; components: ComponentWriteInput[];
}
export interface ProductStateInput {
  expectedVersion: number; publishState: PublishState; saleEnabled: boolean;
}
export interface CategoryWriteInput {
  expectedVersion?: number; nameTh: string; sortOrder: number; visible: boolean;
}
export interface BannerWriteInput {
  expectedVersion?: number; imageId: Id; mobileImageId: Id | null;
  destination: string | null; active: boolean; sortOrder: number;
}
export interface SortInput { rows: { id: Id; expectedVersion: number; sortOrder: number }[] }
export interface BulkCatalogInput {
  rows: { id: Id; expectedVersion: number }[];
  change: { field: "saleEnabled"; value: boolean }
    | { field: "categoryId"; value: Id | null };
}
export interface ShipmentInput {
  expectedVersion: number; carrier: string; trackingId: string;
}
export interface ShipmentBatchInput { rows: ({ orderId: Id } & ShipmentInput)[] }
export interface BatchRowResult<T> {
  id: Id; ok: boolean; data: T | null;
  error: { code: string; message: string } | null;
}
export interface RevisionProposalInput {
  expectedRevision: number; reason: string; recipient: Recipient;
  lines: ({
    sourceItemId: Id; quantity: number;
  } | (LineSelection & { sourceItemId: null; quantity: number }))[];
}
export interface RevisionProposalDto {
  revisionToken: string; expectedRevision: number;
  items: SnapshotItem[]; recipient: Recipient; amounts: Amounts;
  allowed: boolean; issueCodes: string[];
}
export interface RevisionCommitInput {
  expectedRevision: number; reason: string; revisionToken: string;
}
export interface OrderFilters {
  search?: string; createdFrom?: IsoUtc; createdToExclusive?: IsoUtc;
  paymentStatus?: PaymentStatus; shippingStatus?: ShippingStatus;
  page?: number; limit?: number;
}
export interface OrderReportRow {
  order: OrderSummary; buyerName: string; buyerEmail: string;
  recipient: Recipient; items: SnapshotItem[];
}
export interface ProductionRow {
  productId: Id; variantId: Id; nameTh: string;
  sizeTh: string | null; colorTh: string | null;
  quantity: string; singleQuantity: string; bundleQuantity: string;
}
export interface AdminAuditDto {
  id: Id; actorId: number | null; action: string;
  reason: string | null; occurredAt: IsoUtc; before: unknown; after: unknown;
}
export interface NotificationDto {
  eventType: "paid" | "shipped";
  state: "queued" | "sending" | "sent" | "failed" | "unknown";
  attempts: number; lastErrorCode: string | null;
}
export interface AdminOrderDetail extends OrderDetail {
  attempts: PaymentAttemptDto[];
  notifications: NotificationDto[]; audit: AdminAuditDto[];
  exceptions: { code: string; occurredAt: IsoUtc }[];
}
export interface PreviewDto {
  store: StoreDto; products: ProductDto[];
  visibility: "admin_preview"; generatedAt: IsoUtc;
}
