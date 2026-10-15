import type {
  ApiFailure,
  StoreDto,
  ProductDto,
  Page,
  CartDto,
  CartAddInput,
  CartUpdateInput,
  QuoteInput,
  QuoteDto,
  ConfirmOrderInput,
  ConfirmOrderResult,
  OrderSummary,
  OrderDetail,
  AttemptInput,
  AttemptResult,
  PaymentCheckResult,
  OrderRequestDto,
} from "../types/merchandise";
import {
  record,
  uuid,
  type Check,
  storeResponse,
  productResponse,
  pageResponse,
  cartResponse,
  quoteResponse,
  confirmResponse,
  orderSummaryResponse,
  orderResponse,
  attemptResponse,
  checkResponse,
  requestResponse,
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
  if (typeof key !== "string" || !/^[A-Za-z0-9:_-]{1,160}$/.test(key))
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
    const { method = "GET", token, signal } = config,
      mutation = method !== "GET";
    if (
      config.private &&
      (typeof token !== "string" || !token.trim() || /[\r\n]/.test(token))
    )
      throw merchandiseFailure(401, "MERCH_AUTH_REQUIRED");
    const headers = new Headers({ Accept: "application/json" });
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
      throw merchandiseFailure(
        0,
        mutation ? "MERCH_NETWORK_UNKNOWN" : "MERCH_LOAD_FAILED",
        mutation,
      );
    }
  }
  async function errorFor(
    response: Response,
    mutation: boolean,
  ): Promise<MerchandiseApiError> {
    const body: unknown = await response.json().catch(() => null);
    const failure = merchandiseFailure(
      response.status,
      record(body) && safeCode(body.code)
        ? (body.code as string)
        : "MERCH_LOAD_FAILED",
      mutation && response.status >= 500,
    );
    if (
      record(body) &&
      typeof body.requestId === "string" &&
      /^[A-Za-z0-9_-]{1,160}$/.test(body.requestId)
    )
      failure.body.requestId = body.requestId;
    if (
      record(body) &&
      record(body.details) &&
      Number.isSafeInteger(body.details.resourceVersion) &&
      (body.details.resourceVersion as number) >= 0
    )
      failure.body.details = {
        resourceVersion: body.details.resourceVersion as number,
      };
    return failure;
  }
  async function data<T>(
    path: string,
    check: Check,
    config: Parameters<typeof request>[1] = {},
  ): Promise<T> {
    const response = await request(path, config),
      mutation = config?.method !== undefined && config.method !== "GET";
    if (!response.ok) throw await errorFor(response, mutation);
    if (
      !response.headers
        .get("content-type")
        ?.toLowerCase()
        .includes("application/json")
    )
      throw merchandiseFailure(response.status, "MERCH_BAD_RESPONSE", mutation);
    const body: unknown = await response.json().catch(() => null);
    if (!record(body) || body.success !== true || !check(body.data))
      throw merchandiseFailure(response.status, "MERCH_BAD_RESPONSE", mutation);
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
  const paymentIdentity = <
    T extends {
      orderId: string;
      payment: { attempt: { orderId: string } | null };
    },
  >(
    result: T,
    id: string,
  ): T => {
    if (
      result.orderId.toLowerCase() !== id.toLowerCase() ||
      (result.payment.attempt &&
        result.payment.attempt.orderId.toLowerCase() !== id.toLowerCase())
    )
      throw merchandiseFailure(0, "MERCH_BAD_RESPONSE", true);
    return result;
  };
  return {
    async store(eventCode: string, signal?: AbortSignal) {
      const result = await data<StoreDto>(
        `${merchandiseEventBase(eventCode)}/store`,
        storeResponse,
        { signal },
      );
      if (
        result.eventCode !== eventCode ||
        result.categories.some(
          (c) => c.eventId !== result.eventId || !c.visible,
        ) ||
        result.banners.some((b) => b.eventId !== result.eventId || !b.active)
      )
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      return result;
    },
    products: (
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
    cart: (eventCode: string, token: string, signal?: AbortSignal) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart`,
        cartResponse,
        owned(token, signal),
      ),
    add: (
      eventCode: string,
      token: string,
      input: CartAddInput,
      key: string,
      signal?: AbortSignal,
    ) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart/items`,
        cartResponse,
        { ...owned(token, signal), method: "POST", input, key: intentKey(key) },
      ),
    update: (
      eventCode: string,
      token: string,
      id: string,
      input: CartUpdateInput,
      signal?: AbortSignal,
    ) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart/items/${resourceId(id)}`,
        cartResponse,
        { ...owned(token, signal), method: "PATCH", input },
      ),
    remove: (
      eventCode: string,
      token: string,
      id: string,
      expectedRevision: number,
      signal?: AbortSignal,
    ) =>
      data<CartDto>(
        `${merchandiseEventBase(eventCode)}/cart/items/${resourceId(id)}`,
        cartResponse,
        {
          ...owned(token, signal),
          method: "DELETE",
          input: { expectedRevision },
        },
      ),
    quote: (
      eventCode: string,
      token: string,
      input: QuoteInput,
      signal?: AbortSignal,
    ) =>
      data<QuoteDto>(
        `${merchandiseEventBase(eventCode)}/checkout-quotes`,
        quoteResponse,
        { ...owned(token, signal), method: "POST", input },
      ),
    confirm: (
      eventCode: string,
      token: string,
      input: ConfirmOrderInput,
      key: string,
      signal?: AbortSignal,
    ) =>
      data<ConfirmOrderResult>(
        `${merchandiseEventBase(eventCode)}/orders`,
        confirmResponse,
        { ...owned(token, signal), method: "POST", input, key: intentKey(key) },
      ),
    orders: (
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
    async order(id: string, token: string, signal?: AbortSignal) {
      return identity(
        await data<OrderDetail>(
          `/api/v1/merchandise/orders/${resourceId(id)}`,
          orderResponse,
          owned(token, signal),
        ),
        id,
      );
    },
    async createAttempt(
      id: string,
      token: string,
      input: AttemptInput,
      key: string,
      signal?: AbortSignal,
    ) {
      return paymentIdentity(
        await data<AttemptResult>(
          `/api/v1/merchandise/orders/${resourceId(id)}/payment-attempts`,
          attemptResponse,
          {
            ...owned(token, signal),
            method: "POST",
            input,
            key: intentKey(key),
          },
        ),
        id,
      );
    },
    async checkPayment(id: string, token: string, signal?: AbortSignal) {
      return paymentIdentity(
        await data<PaymentCheckResult>(
          `/api/v1/merchandise/orders/${resourceId(id)}/payment-checks`,
          checkResponse,
          { ...owned(token, signal), method: "POST", input: {} },
        ),
        id,
      );
    },
    orderRequest: (
      eventCode: string,
      token: string,
      key: string,
      signal?: AbortSignal,
    ) =>
      data<OrderRequestDto>(
        `${merchandiseEventBase(eventCode)}/order-requests/${encodeURIComponent(intentKey(key))}`,
        requestResponse,
        owned(token, signal),
      ),
    async qr(
      id: string,
      attemptId: string,
      token: string,
      signal?: AbortSignal,
    ): Promise<Blob> {
      const response = await request(
        `/api/v1/merchandise/orders/${resourceId(id)}/payment-attempts/${resourceId(attemptId)}/qr`,
        owned(token, signal),
      );
      if (!response.ok) throw await errorFor(response, false);
      if (
        response.headers
          .get("content-type")
          ?.split(";")[0]
          .trim()
          .toLowerCase() !== "image/png"
      )
        throw merchandiseFailure(response.status, "MERCH_BAD_QR");
      const blob = await response.blob(),
        prefix = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
      if (
        prefix.length !== 8 ||
        ![137, 80, 78, 71, 13, 10, 26, 10].every(
          (value, index) => prefix[index] === value,
        )
      )
        throw merchandiseFailure(response.status, "MERCH_BAD_QR");
      return blob;
    },
  };
}
export type MerchandiseApi = ReturnType<typeof createMerchandiseApi>;
export const merchandiseApi = createMerchandiseApi();
