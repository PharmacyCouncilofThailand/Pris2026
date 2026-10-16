import type {
  ApiFailure,
  StoreDto,
  ProductDto,
  Page,
  CartDto,
  CartItemInput,
  CartItemPatch,
  CreateOrderResult,
  OrderSummary,
  OrderDetail,
  PaymentResult,
  Recipient,
} from "../types/merchandise";
import {
  record,
  uuid,
  type Check,
  storeResponse,
  productResponse,
  pageResponse,
  cartResponse,
  orderSummaryResponse,
  orderResponse,
  createOrderResponse,
  paymentResponse,
} from "./merchandiseResponse";

const messages: Record<number, string> = {
  401: "กรุณาเข้าสู่ระบบอีกครั้ง",
  403: "ไม่สามารถเข้าถึงข้อมูลนี้ได้",
  404: "ไม่พบข้อมูลที่ต้องการ",
  409: "ข้อมูลมีการเปลี่ยนแปลง กรุณาโหลดข้อมูลล่าสุดและตรวจสอบอีกครั้ง",
  422: "กรุณาตรวจสอบข้อมูลที่กรอก",
};
export class MerchandiseApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiFailure,
    public readonly uncertain = false,
  ) {
    super(body.error);
    this.name = "MerchandiseApiError";
  }
}
export function merchandiseFailure(
  status = 0,
  code = "MERCH_LOAD_FAILED",
  uncertain = false,
): MerchandiseApiError {
  return new MerchandiseApiError(
    status,
    {
      success: false,
      code,
      error: messages[status] ?? "โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง",
      requestId: "unavailable",
    },
    uncertain,
  );
}
const safeCode = (value: unknown) =>
  typeof value === "string" && /^[A-Z][A-Z0-9_]{0,99}$/.test(value);
export function merchandiseEventBase(eventCode: string): string {
  if (!/^[A-Za-z0-9_-]{1,50}$/.test(eventCode))
    throw merchandiseFailure(0, "MERCH_INVALID_EVENT");
  return `/api/v1/merchandise/events/${encodeURIComponent(eventCode)}`;
}
const resourceId = (id: string) => {
  if (!uuid(id)) throw merchandiseFailure(0, "MERCH_INVALID_ID");
  return encodeURIComponent(id.toLowerCase());
};
const intentKey = (key: string) => {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(key))
    throw merchandiseFailure(0, "MERCH_INVALID_REQUEST_KEY");
  return key;
};
export interface MerchandiseCatalogFilters {
  search?: string;
  categoryId?: string;
  kind?: "single" | "bundle";
  page?: number;
  limit?: number;
}
export interface MerchandisePageFilters {
  page?: number;
  limit?: number;
}
function query(filters: MerchandiseCatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.search?.trim()) {
    if (filters.search.trim().length > 200)
      throw merchandiseFailure(0, "MERCH_INVALID_SEARCH");
    params.set("search", filters.search.trim());
  }
  if (filters.categoryId) {
    resourceId(filters.categoryId);
    params.set("categoryId", filters.categoryId);
  }
  if (filters.kind) {
    if (!["single", "bundle"].includes(filters.kind))
      throw merchandiseFailure(0, "MERCH_INVALID_KIND");
    params.set("kind", filters.kind);
  }
  for (const key of ["page", "limit"] as const)
    if (filters[key] !== undefined) {
      const value = filters[key]!;
      if (
        !Number.isSafeInteger(value) ||
        value <= 0 ||
        (key === "limit" && value > 100)
      )
        throw merchandiseFailure(0, "MERCH_INVALID_PAGE");
      params.set(key, String(value));
    }
  return params.size ? "?" + params : "";
}
type ClientOptions = { baseUrl?: string; fetcher?: typeof fetch };
export function createMerchandiseApi(options: ClientOptions = {}) {
  const base = (
    options.baseUrl ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3002"
  ).replace(/\/+$/, "");
  const fetcher: typeof fetch =
    options.fetcher ?? ((input, init) => fetch(input, init));
  async function request(
    path: string,
    config: {
      method?: string;
      token?: string;
      private?: boolean;
      input?: unknown;
      key?: string;
      signal?: AbortSignal;
    } = {},
  ) {
    const { method = "GET", token, signal } = config;
    if (
      config.private &&
      (typeof token !== "string" || !token.trim() || /[\r\n]/.test(token))
    )
      throw merchandiseFailure(401, "MERCH_AUTH_REQUIRED");
    const headers = new Headers({ Accept: "application/json" });
    // Free ngrok API domains interpose a browser warning unless this is sent.
    if (process.env.NEXT_PUBLIC_API_NGROK === "1")
      headers.set("ngrok-skip-browser-warning", "true");
    if (config.private) headers.set("Authorization", `Bearer ${token}`);
    if (config.key !== undefined)
      headers.set("Idempotency-Key", intentKey(config.key));
    if (config.input !== undefined)
      headers.set("Content-Type", "application/json");
    try {
      return await fetcher(base + path, {
        method,
        headers,
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal,
        ...(config.input !== undefined
          ? { body: JSON.stringify(config.input) }
          : {}),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw merchandiseFailure(0, "MERCH_NETWORK_UNKNOWN", true);
    }
  }
  async function errorFor(response: Response): Promise<MerchandiseApiError> {
    const body: unknown = await response.json().catch(() => null);
    const failure = merchandiseFailure(
      response.status,
      record(body) && safeCode(body.code)
        ? (body.code as string)
        : "MERCH_LOAD_FAILED",
      response.status >= 500,
    );
    if (record(body)) {
      if (typeof body.error === "string" && body.error.trim())
        failure.body.error = body.error;
      failure.message = failure.body.error;
      if (
        typeof body.requestId === "string" &&
        /^[A-Za-z0-9_-]{1,160}$/.test(body.requestId)
      )
        failure.body.requestId = body.requestId;
      if (record(body.details)) failure.body.details = body.details;
    }
    return failure;
  }
  async function data<T>(
    path: string,
    check: Check,
    config: Parameters<typeof request>[1] = {},
  ): Promise<T> {
    const response = await request(path, config);
    if (!response.ok) throw await errorFor(response);
    const body: unknown = await response.json().catch(() => null);
    if (!record(body) || body.success !== true || !check(body.data))
      throw merchandiseFailure(response.status, "MERCH_BAD_RESPONSE");
    return body.data as T;
  }
  const owned = (token: string, signal?: AbortSignal) => ({
    private: true,
    token,
    signal,
  });
  const identity = <T extends { id: string }>(result: T, id: string): T => {
    if (result.id.toLowerCase() !== id.toLowerCase())
      throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
    return result;
  };
  return {
    async store(eventCode: string, signal?: AbortSignal) {
      const result = await data<StoreDto>(
        `${merchandiseEventBase(eventCode)}/store`,
        storeResponse,
        { signal },
      );
      if (result.eventCode !== eventCode)
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      return result;
    },
    products: async (
      eventCode: string,
      filters: MerchandiseCatalogFilters = {},
      signal?: AbortSignal,
    ) =>
      data<Page<ProductDto>>(
        `${merchandiseEventBase(eventCode)}/products${query(filters)}`,
        pageResponse(productResponse),
        { signal },
      ),
    async product(eventCode: string, id: string, signal?: AbortSignal) {
      return identity(
        await data<ProductDto>(
          `${merchandiseEventBase(eventCode)}/products/${resourceId(id)}`,
          productResponse,
          { signal },
        ),
        id,
      );
    },
    cart: async (eventCode: string, token: string, signal?: AbortSignal) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart`,
        cartResponse,
        owned(token, signal),
      ),
    addCartItem: async (
      eventCode: string,
      token: string,
      input: CartItemInput,
      signal?: AbortSignal,
    ) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart/items`,
        cartResponse,
        { ...owned(token, signal), method: "POST", input },
      ),
    updateCartItem: async (
      eventCode: string,
      token: string,
      itemId: string,
      input: CartItemPatch,
      signal?: AbortSignal,
    ) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart/items/${resourceId(itemId)}`,
        cartResponse,
        { ...owned(token, signal), method: "PATCH", input },
      ),
    removeCartItem: async (
      eventCode: string,
      token: string,
      itemId: string,
      signal?: AbortSignal,
    ) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart/items/${resourceId(itemId)}`,
        cartResponse,
        { ...owned(token, signal), method: "DELETE" },
      ),
    createOrder: async (
      eventCode: string,
      token: string,
      key: string,
      input: { cartVersion: string; recipient: Recipient },
      signal?: AbortSignal,
    ) =>
      data<CreateOrderResult>(
        `${merchandiseEventBase(eventCode)}/orders`,
        createOrderResponse,
        { ...owned(token, signal), method: "POST", input, key: intentKey(key) },
      ),
    orders: async (
      eventCode: string,
      token: string,
      filters: MerchandisePageFilters = {},
      signal?: AbortSignal,
    ) =>
      data<Page<OrderSummary>>(
        `${merchandiseEventBase(eventCode)}/orders${query(filters)}`,
        pageResponse(orderSummaryResponse),
        owned(token, signal),
      ),
    async order(token: string, orderId: string, signal?: AbortSignal) {
      return identity(
        await data<OrderDetail>(
          `/api/v1/merchandise/orders/${resourceId(orderId)}`,
          orderResponse,
          owned(token, signal),
        ),
        orderId,
      );
    },
    checkPayment: async (
      token: string,
      orderId: string,
      signal?: AbortSignal,
    ) =>
      data<PaymentResult>(
        `/api/v1/merchandise/orders/${resourceId(orderId)}/payment-checks`,
        paymentResponse,
        { ...owned(token, signal), method: "POST" },
      ),
    requestQr: async (token: string, orderId: string, signal?: AbortSignal) =>
      data<PaymentResult>(
        `/api/v1/merchandise/orders/${resourceId(orderId)}/payment-attempts`,
        paymentResponse,
        { ...owned(token, signal), method: "POST" },
      ),
  };
}
export type MerchandiseApi = ReturnType<typeof createMerchandiseApi>;
export const merchandiseApi = createMerchandiseApi();
