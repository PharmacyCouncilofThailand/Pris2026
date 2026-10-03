export type LocalizedText = { th: string; en: string };

export type LuckyWheelSegment = {
  id: string;
  kind: "prize" | "no_prize";
  name: LocalizedText;
  imageKey: string | null;
  enabled: boolean;
  position: number;
  remaining: number | null;
};

export type LuckyWheelConfigurationSegment = {
  id: string;
  kind: "prize" | "no_prize";
  name: LocalizedText;
  imageId: string | null;
  enabled: boolean;
  position: number;
};

export type LuckyWheelConfiguration = {
  segments: LuckyWheelConfigurationSegment[];
  collectionInstructions: LocalizedText;
  collectionDeadline: string;
};

export type LuckyWheelSpin = {
  id: string;
  eventId: number;
  userId: number;
  playDate: string;
  attendanceId: string;
  attendanceCheckedInAt: string;
  segmentId: string;
  outcomeKind: "prize" | "no_prize";
  awardedName: LocalizedText;
  awardedImageKey: string | null;
  configurationVersion: number;
  poolRevision: number;
  createdAt: string;
  configurationSnapshot: unknown;
  outcomeSnapshot: unknown;
};

export type LuckyWheelBlockCode =
  | "CHECKIN_REQUIRED"
  | "REGISTRATION_REQUIRED"
  | "ACCOUNT_UNAVAILABLE"
  | "SESSION_CLOSED"
  | "WHEEL_PAUSED"
  | "WHEEL_NOT_READY"
  | "OUT_OF_STOCK"
  | "ALREADY_SPUN"
  | "WHEEL_UPDATED"
  | "IDEMPOTENCY_CONFLICT"
  | "REDEMPTION_CLOSED"
  | "ADMIN_REQUIRED";

export type LuckyWheelEligibility = {
  eventId: number;
  userId: number;
  eligible: boolean;
  blockCode: LuckyWheelBlockCode | null;
  serverNow: string;
  playDate: string;
  configurationVersion: number | null;
  poolRevision: number | null;
  paused: boolean;
  configuration: LuckyWheelConfiguration | null;
  availability: LuckyWheelSegment[];
  existingSpin: LuckyWheelSpin | null;
  requestId: string;
};

export type LuckyWheelState = Pick<
  LuckyWheelEligibility,
  | "eventId"
  | "serverNow"
  | "playDate"
  | "configurationVersion"
  | "poolRevision"
  | "paused"
  | "configuration"
  | "availability"
>;

export type LuckyWheelHistoryItem = {
  spinId: string;
  eventId: number;
  outcomeKind: "prize" | "no_prize";
  prize: {
    name: LocalizedText;
    imageKey: string | null;
    awardedAt: string;
  };
  claimGeneration: number | null;
  status: "open" | "redeemed" | null;
  redeemedAt: string | null;
  redeemedBy: number | null;
  collectionPoint: string | null;
  deliveredDetails: string | null;
  collectionInstructions: LocalizedText | null;
  collectionDeadline: string | null;
};

export type LuckyWheelHistoryResponse = {
  eventId: number;
  items: LuckyWheelHistoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  requestId: string;
};

export type OwnedLuckyWheelSpin = {
  spinId: string;
  eventId: number;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  prize: {
    name: LocalizedText;
    imageKey: string | null;
    awardedAt: string;
  };
  claimGeneration: number | null;
  status: "open" | "redeemed" | null;
  redeemedAt: string | null;
  redeemedBy: number | null;
  collectionPoint: string | null;
  deliveredDetails: string | null;
  collectionInstructions: LocalizedText | null;
  collectionDeadline: string | null;
  rewardProof: null | {
    qrPayload: string;
    displayCode: string;
  };
  requestId: string;
};

export type PendingSpinRequest = {
  userId: number;
  eventId: number;
  configurationVersion: number;
  poolRevision: number;
  idempotencyKey: string;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export class LuckyWheelApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "LuckyWheelApiError";
  }
}

export function resolveWheelImageUrl(
  imageKey: string | null,
  publicBaseUrl: string | undefined,
): string | null {
  if (!imageKey || !publicBaseUrl) return null;
  if (
    imageKey.startsWith("/") ||
    imageKey.includes("\\") ||
    imageKey.split("/").some((part) => part === "..")
  ) {
    return null;
  }
  let base: URL;
  try {
    base = new URL(publicBaseUrl);
  } catch {
    return null;
  }
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  ) {
    return null;
  }
  return new URL(imageKey, `${base.origin}/`).toString();
}

function endpoint(apiOrigin: string, eventId: number, suffix = "") {
  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw new Error("Invalid Lucky Wheel event id");
  }
  return `${apiOrigin.replace(/\/$/, "")}/api/lucky-wheel/events/${eventId}${suffix}`;
}

async function requestJson<T>(
  url: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  if (!token) throw new LuckyWheelApiError(401, "AUTH_REQUIRED", "Authentication required");
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  if (typeof init.body === "string") headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers, cache: "no-store" });
  } catch (error) {
    throw new LuckyWheelApiError(
      0,
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed",
    );
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const record =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};
    throw new LuckyWheelApiError(
      response.status,
      typeof record.code === "string" ? record.code : "REQUEST_FAILED",
      typeof record.error === "string" ? record.error : `Request failed (${response.status})`,
      record.details,
    );
  }
  return body as T;
}

export async function loadEligibility(
  apiOrigin: string,
  token: string,
  eventId: number,
  signal?: AbortSignal,
): Promise<LuckyWheelEligibility> {
  return requestJson<LuckyWheelEligibility>(
    endpoint(apiOrigin, eventId, "/eligibility"),
    token,
    { signal },
  );
}

export async function loadWheel(
  apiOrigin: string,
  token: string,
  eventId: number,
  signal?: AbortSignal,
): Promise<LuckyWheelState> {
  const eligibility = await loadEligibility(apiOrigin, token, eventId, signal);
  return {
    eventId: eligibility.eventId,
    serverNow: eligibility.serverNow,
    playDate: eligibility.playDate,
    configurationVersion: eligibility.configurationVersion,
    poolRevision: eligibility.poolRevision,
    paused: eligibility.paused,
    configuration: eligibility.configuration,
    availability: eligibility.availability,
  };
}

export async function submitSpin(
  apiOrigin: string,
  token: string,
  request: PendingSpinRequest,
  signal?: AbortSignal,
): Promise<{ created: boolean; spin: LuckyWheelSpin; requestId: string }> {
  return requestJson(
    endpoint(apiOrigin, request.eventId, "/spins"),
    token,
    {
      method: "POST",
      signal,
      body: JSON.stringify({
        eventId: request.eventId,
        configurationVersion: request.configurationVersion,
        poolRevision: request.poolRevision,
        idempotencyKey: request.idempotencyKey,
      }),
    },
  );
}

export async function loadOwnSpins(
  apiOrigin: string,
  token: string,
  eventId: number,
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
): Promise<LuckyWheelHistoryResponse> {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    throw new Error("Invalid Lucky Wheel history pagination");
  }
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return requestJson<LuckyWheelHistoryResponse>(
    endpoint(apiOrigin, eventId, `/spins?${query.toString()}`),
    token,
    { signal },
  );
}

export async function loadOwnSpin(
  apiOrigin: string,
  token: string,
  eventId: number,
  spinId: string,
  signal?: AbortSignal,
): Promise<OwnedLuckyWheelSpin> {
  if (!/^[0-9a-f-]{36}$/i.test(spinId)) throw new Error("Invalid spin id");
  return requestJson<OwnedLuckyWheelSpin>(
    endpoint(apiOrigin, eventId, `/spins/${spinId}`),
    token,
    { signal },
  );
}

function pendingKey(userId: number, eventId: number) {
  return `pris:lucky-wheel:pending:${userId}:${eventId}`;
}

export function loadPendingSpinRequest(
  storage: StorageLike,
  userId: number,
  eventId: number,
): PendingSpinRequest | null {
  const raw = storage.getItem(pendingKey(userId, eventId));
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PendingSpinRequest>;
    if (
      value.userId !== userId ||
      value.eventId !== eventId ||
      !Number.isInteger(value.configurationVersion) ||
      !Number.isInteger(value.poolRevision) ||
      typeof value.idempotencyKey !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(value.idempotencyKey)
    ) {
      storage.removeItem(pendingKey(userId, eventId));
      return null;
    }
    return value as PendingSpinRequest;
  } catch {
    storage.removeItem(pendingKey(userId, eventId));
    return null;
  }
}

export function getOrCreatePendingSpinRequest(
  storage: StorageLike,
  userId: number,
  eventId: number,
  configurationVersion: number,
  poolRevision: number,
): PendingSpinRequest {
  const existing = loadPendingSpinRequest(storage, userId, eventId);
  if (existing) return existing;

  const request: PendingSpinRequest = {
    userId,
    eventId,
    configurationVersion,
    poolRevision,
    idempotencyKey: crypto.randomUUID(),
  };
  storage.setItem(pendingKey(userId, eventId), JSON.stringify(request));
  return request;
}

export function clearPendingSpinRequest(
  storage: StorageLike,
  userId: number,
  eventId: number,
) {
  storage.removeItem(pendingKey(userId, eventId));
}
