import assert from "node:assert/strict";
import test from "node:test";
import {
  LuckyWheelApiError,
  captureQrClaimFromFragment,
  clearPendingQrClaim,
  claimQrCredit,
  clearPendingSpinRequest,
  getOrCreatePendingSpinRequest,
  loadEligibility,
  loadOwnSpin,
  loadOwnSpins,
  loadQrPreview,
  loadPendingSpinRequest,
  loadWheel,
  resolveWheelImageUrl,
  submitSpin,
  type StorageLike,
} from "./luckyWheel.js";

const qrId = "123e4567-e89b-42d3-a456-426614174000";

test("camera fragment stores one validated QR id for login and strips unsafe inputs", () => {
  const storage = new MemoryStorage();
  assert.equal(captureQrClaimFromFragment(storage, `#${qrId}`), qrId);
  assert.equal(captureQrClaimFromFragment(storage, ""), qrId);
  assert.equal(captureQrClaimFromFragment(storage, "#https://evil.test"), null);
  assert.equal(captureQrClaimFromFragment(storage, ""), null);
  assert.equal(captureQrClaimFromFragment(storage, `#${qrId}`), qrId);
  clearPendingQrClaim(storage);
  assert.equal(captureQrClaimFromFragment(storage, ""), null);
});

test("QR preview and first/duplicate claims use authenticated server endpoints", async () => {
  const originalFetch = globalThis.fetch;
  let claimCount = 0;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer token");
      assert.equal(init?.cache, "no-store");
      if (init?.method === "POST") {
        assert.equal(String(input), "https://api.example.test/api/lucky-wheel/events/7/credit-claims");
        assert.deepEqual(JSON.parse(String(init.body)), { qrId });
        claimCount += 1;
        return Response.json({
          created: claimCount === 1, qrId, qrName: "Morning", creditId: "credit-1",
          date: "2026-10-29", claimedAt: "2026-10-29T08:00:00.000Z",
          currentDeadline: "2026-10-29T12:00:00.000Z", state: "spendable",
        }, { status: claimCount === 1 ? 201 : 200 });
      }
      assert.equal(String(input), `https://api.example.test/api/lucky-wheel/events/7/qr-codes/${qrId}`);
      return Response.json({ qrId, name: "Morning", status: "open", date: "2026-10-29",
        startAt: "2026-10-29T02:00:00.000Z", currentDeadline: "2026-10-29T12:00:00.000Z",
        scheduleVersion: 1 });
    };
    assert.equal((await loadQrPreview("https://api.example.test", "token", 7, qrId)).name, "Morning");
    assert.equal((await claimQrCredit("https://api.example.test", "token", 7, qrId)).created, true);
    assert.equal((await claimQrCredit("https://api.example.test", "token", 7, qrId)).created, false);
    assert.equal(claimCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("QR claim preserves server block codes and uncertain network outcomes", async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const code of ["WHEEL_NOT_READY", "CHECKIN_REQUIRED", "SESSION_CLOSED"]) {
      globalThis.fetch = async () => Response.json({ code, error: code }, { status: 409 });
      await assert.rejects(
        claimQrCredit("https://api.example.test", "token", 7, qrId),
        (error: unknown) => error instanceof LuckyWheelApiError && error.code === code,
      );
    }
    globalThis.fetch = async () => { throw new TypeError("offline"); };
    await assert.rejects(
      claimQrCredit("https://api.example.test", "token", 7, qrId),
      (error: unknown) => error instanceof LuckyWheelApiError && error.status === 0,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const eligibility = {
  eventId: 7,
  userId: 11,
  eligible: true,
  blockCode: null,
  serverNow: "2026-10-29T09:00:00.000Z",
  playDate: "2026-10-29",
  configurationVersion: 4,
  poolRevision: 6,
  paused: false,
  configuration: {
    segments: [{
      id: "123e4567-e89b-42d3-a456-426614174001",
      kind: "prize",
      name: { th: "เสื้อ", en: "Shirt" },
      imageId: null,
      enabled: true,
      position: 0,
    }],
    collectionInstructions: { th: "โต๊ะกิจกรรม", en: "Activity desk" },
    collectionDeadline: "2026-10-30T10:00:00.000Z",
  },
  availability: [{
    id: "123e4567-e89b-42d3-a456-426614174001",
    kind: "prize",
    name: { th: "เสื้อ", en: "Shirt" },
    imageKey: null,
    enabled: true,
    position: 0,
    remaining: 3,
  }],
  unspentCredits: 2,
  spendableCredits: 2,
  hasExpiredPriorDayCredit: false,
  currentWindow: { id: qrId, date: "2026-10-29", startAt: "2026-10-29T02:00:00.000Z", endAt: "2026-10-29T12:00:00.000Z", version: 3 },
  latestSpin: null,
  requestId: "req-1",
};

test("wheel image URLs use only a trusted public root and fail closed", () => {
  assert.equal(
    resolveWheelImageUrl(
      "events/7/wheel/prize.webp",
      "https://images.example.test",
    ),
    "https://images.example.test/events/7/wheel/prize.webp",
  );
  assert.equal(resolveWheelImageUrl(null, "https://images.example.test"), null);
  assert.equal(resolveWheelImageUrl("events/7/wheel/prize.webp", undefined), null);
  assert.equal(resolveWheelImageUrl("../secret", "https://images.example.test"), null);
  assert.equal(resolveWheelImageUrl("/absolute", "https://images.example.test"), null);
  assert.equal(resolveWheelImageUrl("events\\bad", "https://images.example.test"), null);
  assert.equal(resolveWheelImageUrl("events/good", "javascript:alert(1)"), null);
  assert.equal(resolveWheelImageUrl("events/good", "https://user:pass@example.test"), null);
});

test("loads authenticated eligibility/wheel state and preserves server errors", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://api.example.test/api/lucky-wheel/events/7/eligibility");
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer token");
      assert.equal(init?.cache, "no-store");
      return Response.json(eligibility);
    };

    const loaded = await loadEligibility("https://api.example.test/", "token", 7);
    assert.equal(loaded.configurationVersion, 4);
    const wheel = await loadWheel("https://api.example.test", "token", 7);
    assert.equal(wheel.poolRevision, 6);
    assert.equal(wheel.availability[0].remaining, 3);

    globalThis.fetch = async () =>
      Response.json(
        { success: false, code: "AUTH_REQUIRED", error: "Authentication required" },
        { status: 401 },
      );
    await assert.rejects(
      loadEligibility("https://api.example.test", "token", 7),
      (error: unknown) =>
        error instanceof LuckyWheelApiError &&
        error.status === 401 &&
        error.code === "AUTH_REQUIRED",
    );

    globalThis.fetch = async () =>
      Response.json(
        { success: false, code: "WHEEL_NOT_READY", error: "Unavailable" },
        { status: 503 },
      );
    await assert.rejects(
      loadEligibility("https://api.example.test", "token", 7),
      (error: unknown) =>
        error instanceof LuckyWheelApiError &&
        error.status === 503 &&
        error.code === "WHEEL_NOT_READY",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("spin submission sends only server-authoritative revision fields and reuses its request key", async () => {
  const storage = new MemoryStorage();
  const first = getOrCreatePendingSpinRequest(storage, 11, 7, 4, 6, 3);
  const second = getOrCreatePendingSpinRequest(storage, 11, 7, 99, 99, 9);
  assert.equal(second.idempotencyKey, first.idempotencyKey);
  assert.equal(second.configurationVersion, 4);
  assert.equal(second.poolRevision, 6);
  assert.equal(second.scheduleVersion, 3);

  const otherUser = getOrCreatePendingSpinRequest(storage, 12, 7, 4, 6, 3);
  assert.notEqual(otherUser.idempotencyKey, first.idempotencyKey);

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://api.example.test/api/lucky-wheel/events/7/spins");
      assert.equal(init?.method, "POST");
      const body = JSON.parse(String(init?.body));
      assert.deepEqual(body, {
        eventId: 7,
        configurationVersion: 4,
        poolRevision: 6,
        scheduleVersion: 3,
        idempotencyKey: first.idempotencyKey,
      });
      assert.equal("segmentId" in body, false);
      assert.equal("playDate" in body, false);
      assert.equal("userId" in body, false);
      return Response.json({
        created: true,
        spin: {
          id: "123e4567-e89b-42d3-a456-426614174002",
          eventId: 7,
          userId: 11,
          playDate: "2026-10-29",
          attendanceId: "123e4567-e89b-42d3-a456-426614174003",
          attendanceCheckedInAt: "2026-10-29T08:55:00.000Z",
          segmentId: "123e4567-e89b-42d3-a456-426614174001",
          outcomeKind: "prize",
          awardedName: { th: "เสื้อ", en: "Shirt" },
          awardedImageKey: null,
          configurationVersion: 4,
          poolRevision: 6,
          createdAt: "2026-10-29T09:01:00.000Z",
          configurationSnapshot: {},
          outcomeSnapshot: {},
        },
        requestId: "req-2",
      }, { status: 201 });
    };
    const result = await submitSpin("https://api.example.test", "token", first);
    assert.equal(result.created, true);
    assert.equal(result.spin.outcomeKind, "prize");
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.deepEqual(loadPendingSpinRequest(storage, 11, 7), first);
  clearPendingSpinRequest(storage, 11, 7);
  assert.equal(loadPendingSpinRequest(storage, 11, 7), null);
  const next = getOrCreatePendingSpinRequest(storage, 11, 7, 4, 6, 4);
  assert.notEqual(next.idempotencyKey, first.idempotencyKey);
  assert.equal(next.scheduleVersion, 4);
});

test("network failure remains unknown and does not clear the pending request", async () => {
  const storage = new MemoryStorage();
  const pending = getOrCreatePendingSpinRequest(storage, 11, 7, 4, 6, 3);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => {
      throw new TypeError("offline");
    };
    await assert.rejects(
      submitSpin("https://api.example.test", "token", pending),
      (error: unknown) =>
        error instanceof LuckyWheelApiError &&
        error.status === 0 &&
        error.code === "NETWORK_ERROR",
    );
    assert.deepEqual(loadPendingSpinRequest(storage, 11, 7), pending);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("current schedule can close and reopen the same unspent credits; prior day stays expired", async () => {
  const originalFetch = globalThis.fetch;
  const closed = { ...eligibility, eligible: false, blockCode: "DAY_WINDOW_CLOSED",
    unspentCredits: 2, spendableCredits: 0,
    currentWindow: { ...eligibility.currentWindow, version: 4, endAt: "2026-10-29T10:00:00.000Z" } };
  const reopened = { ...eligibility, eligible: true, blockCode: null,
    unspentCredits: 2, spendableCredits: 2,
    currentWindow: { ...eligibility.currentWindow, version: 5, endAt: "2026-10-29T13:00:00.000Z" } };
  const priorDay = { ...eligibility, eligible: false, blockCode: "NO_CREDIT",
    playDate: "2026-10-30", unspentCredits: 0, spendableCredits: 0,
    hasExpiredPriorDayCredit: true, currentWindow: null };
  const states = [closed, reopened, priorDay];
  try {
    globalThis.fetch = async () => Response.json(states.shift());
    const first = await loadEligibility("https://api.example.test", "token", 7);
    const second = await loadEligibility("https://api.example.test", "token", 7);
    const third = await loadEligibility("https://api.example.test", "token", 7);
    assert.deepEqual([first.unspentCredits, first.spendableCredits, first.currentWindow?.version], [2, 0, 4]);
    assert.deepEqual([second.unspentCredits, second.spendableCredits, second.currentWindow?.version], [2, 2, 5]);
    assert.equal(third.hasExpiredPriorDayCredit, true);
    assert.equal(third.spendableCredits, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("owner history uses server pagination and contains no reward credentials", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(
        String(input),
        "https://api.example.test/api/lucky-wheel/events/7/spins?page=2&pageSize=2",
      );
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer token");
      assert.equal(init?.cache, "no-store");
      return Response.json({
        eventId: 7,
        items: [
          {
            spinId: "123e4567-e89b-42d3-a456-426614174002",
            eventId: 7,
            outcomeKind: "prize",
            prize: {
              name: { th: "เสื้อ", en: "Shirt" },
              imageKey: null,
              awardedAt: "2026-10-29T09:01:00.000Z",
            },
            claimGeneration: 2,
            status: "redeemed",
            redeemedAt: "2026-10-29T10:00:00.000Z",
            redeemedBy: 4,
            collectionPoint: "Activity desk",
            deliveredDetails: "Size M",
            collectionInstructions: { th: "โต๊ะกิจกรรม", en: "Activity desk" },
            collectionDeadline: "2026-10-30T10:00:00.000Z",
          },
          {
            spinId: "123e4567-e89b-42d3-a456-426614174004",
            eventId: 7,
            outcomeKind: "no_prize",
            prize: {
              name: { th: "ไม่ได้รับรางวัล", en: "No prize" },
              imageKey: null,
              awardedAt: "2026-10-28T09:01:00.000Z",
            },
            claimGeneration: null,
            status: null,
            redeemedAt: null,
            redeemedBy: null,
            collectionPoint: null,
            deliveredDetails: null,
            collectionInstructions: { th: "โต๊ะกิจกรรม", en: "Activity desk" },
            collectionDeadline: "2026-10-30T10:00:00.000Z",
          },
        ],
        pagination: { page: 2, pageSize: 2, total: 4, totalPages: 2 },
        requestId: "req-history",
      });
    };
    const history = await loadOwnSpins(
      "https://api.example.test",
      "token",
      7,
      2,
      2,
    );
    assert.deepEqual(history.pagination, {
      page: 2,
      pageSize: 2,
      total: 4,
      totalPages: 2,
    });
    assert.deepEqual(
      history.items.map((item) => item.outcomeKind),
      ["prize", "no_prize"],
    );
    for (const item of history.items as Array<Record<string, unknown>>) {
      assert.equal("rewardProof" in item, false);
      assert.equal("qrPayload" in item, false);
      assert.equal("displayCode" in item, false);
      assert.equal("rewardToken" in item, false);
    }

    globalThis.fetch = async () =>
      Response.json(
        { success: false, code: "AUTH_REQUIRED", error: "Authentication required" },
        { status: 401 },
      );
    await assert.rejects(
      loadOwnSpins("https://api.example.test", "token", 7),
      (error: unknown) =>
        error instanceof LuckyWheelApiError &&
        error.status === 401 &&
        error.code === "AUTH_REQUIRED",
    );

    globalThis.fetch = async () =>
      Response.json(
        { success: false, code: "HISTORY_UNAVAILABLE", error: "Unavailable" },
        { status: 503 },
      );
    await assert.rejects(
      loadOwnSpins("https://api.example.test", "token", 7),
      (error: unknown) =>
        error instanceof LuckyWheelApiError &&
        error.status === 503 &&
        error.code === "HISTORY_UNAVAILABLE",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("owner detail is authenticated and bounded to an explicit spin id", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (input) => {
      assert.equal(
        String(input),
        "https://api.example.test/api/lucky-wheel/events/7/spins/123e4567-e89b-42d3-a456-426614174002",
      );
      return Response.json({
        spinId: "123e4567-e89b-42d3-a456-426614174002",
        eventId: 7,
        owner: { id: 11, firstName: "A", lastName: "B", email: "a@example.test" },
        prize: {
          name: { th: "เสื้อ", en: "Shirt" },
          imageKey: null,
          awardedAt: "2026-10-29T09:01:00.000Z",
        },
        claimGeneration: 1,
        status: "open",
        redeemedAt: null,
        redeemedBy: null,
        collectionPoint: null,
        deliveredDetails: null,
        collectionInstructions: { th: "โต๊ะกิจกรรม", en: "Activity desk" },
        collectionDeadline: "2026-10-30T10:00:00.000Z",
        rewardProof: { qrPayload: "PRIS-REWARD:opaque", displayCode: "ABCD-EFGH" },
        requestId: "req-3",
      });
    };
    const detail = await loadOwnSpin(
      "https://api.example.test",
      "token",
      7,
      "123e4567-e89b-42d3-a456-426614174002",
    );
    assert.equal(detail.rewardProof?.qrPayload.startsWith("PRIS-REWARD:"), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
