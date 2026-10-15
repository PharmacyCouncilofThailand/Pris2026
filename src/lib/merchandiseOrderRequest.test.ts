import test from "node:test";
import assert from "node:assert/strict";
import {
  beginOrderRequest,
  readOrderRequest,
  acknowledgeOrderRequest,
  recoverOrderRequest,
  clearOtherOrderRequests,
  beginAttemptRequest,
  readAttemptRequest,
  acknowledgeAttemptRequest,
  attemptResultKnown,
} from "./merchandiseOrderRequest";
import { createMerchandiseApi } from "./merchandiseApi";
import { ids, now } from "../../tests/merchandise/data";
import type { PaymentView } from "../types/merchandise";
function storage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
    clear: () => values.clear(),
  };
}
test("confirmation record persists key/event only, refuses another unknown intent and is owner scoped", () => {
  const s = storage();
  const request = beginOrderRequest(s, "PRIS-2026", 1, ids.item);
  assert.deepEqual(request, { key: ids.item, eventCode: "PRIS-2026" });
  assert.deepEqual(readOrderRequest(s, "PRIS-2026", 1), request);
  assert.equal(readOrderRequest(s, "PRIS-2026", 2), null);
  assert.throws(() => beginOrderRequest(s, "PRIS-2026", 1, ids.order));
  acknowledgeOrderRequest(s, "PRIS-2026", 1, ids.order);
  assert.ok(readOrderRequest(s, "PRIS-2026", 1));
  acknowledgeOrderRequest(s, "PRIS-2026", 1, ids.item);
  assert.equal(readOrderRequest(s, "PRIS-2026", 1), null);
});
test("unknown/not-found/processing outcomes preserve the key and never create an order", async () => {
  const s = storage();
  beginOrderRequest(s, "PRIS-2026", 1, ids.item);
  let posts = 0;
  let state = "not_found";
  const api = createMerchandiseApi({
    fetcher: async (_url, init) => {
      if (init?.method === "POST") posts++;
      return Response.json({
        success: true,
        data: { state, orderId: null, error: null, serverNow: now },
      });
    },
  });
  const options = {
    storage: s,
    eventCode: "PRIS-2026",
    buyerId: 1,
    token: "synthetic",
    api,
    isCurrent: () => true,
  };
  assert.equal((await recoverOrderRequest(options)).kind, "unknown");
  state = "processing";
  assert.equal((await recoverOrderRequest(options)).kind, "processing");
  assert.equal(posts, 0);
  assert.equal(readOrderRequest(s, "PRIS-2026", 1)?.key, ids.item);
});
test("completed recovery uses the known order ID, while a stale owner cannot acknowledge or expose it", async () => {
  const s = storage();
  beginOrderRequest(s, "PRIS-2026", 1, ids.item);
  const api = createMerchandiseApi({
    fetcher: async () =>
      Response.json({
        success: true,
        data: {
          state: "completed",
          orderId: ids.order,
          error: null,
          serverNow: now,
        },
      }),
  });
  const options = {
    storage: s,
    eventCode: "PRIS-2026",
    buyerId: 1,
    token: "synthetic",
    api,
    isCurrent: () => true,
  };
  assert.deepEqual(await recoverOrderRequest(options), {
    kind: "completed",
    orderId: ids.order,
    key: ids.item,
  });
  assert.ok(readOrderRequest(s, "PRIS-2026", 1));
  assert.equal(
    (await recoverOrderRequest({ ...options, isCurrent: () => false })).kind,
    "cancelled",
  );
});
test("only a definite failed request is cleared; denied/tampered storage blocks new confirmation", async () => {
  const s = storage();
  beginOrderRequest(s, "PRIS-2026", 1, ids.item);
  const api = createMerchandiseApi({
    fetcher: async () =>
      Response.json({
        success: true,
        data: {
          state: "failed",
          orderId: null,
          error: {
            code: "MERCH_QUOTE_CHANGED",
            message: "Synthetic unsafe raw message",
          },
          serverNow: now,
        },
      }),
  });
  const value = await recoverOrderRequest({
    storage: s,
    eventCode: "PRIS-2026",
    buyerId: 1,
    token: "synthetic",
    api,
    isCurrent: () => true,
  });
  assert.equal(value.kind, "failed");
  assert.equal(readOrderRequest(s, "PRIS-2026", 1), null);
  s.getItem = () => {
    throw Error("denied");
  };
  assert.throws(() => readOrderRequest(s, "PRIS-2026", 1));
  assert.throws(() => beginOrderRequest(s, "PRIS-2026", 1, ids.order));
});
test("explicit logout/another owner clears only merchandise order records", () => {
  const s = storage();
  s.setItem("unrelated", "keep");
  beginOrderRequest(s, "PRIS-2026", 1, ids.item);
  clearOtherOrderRequests(s, 2);
  assert.equal(readOrderRequest(s, "PRIS-2026", 1), null);
  assert.equal(s.getItem("unrelated"), "keep");
  beginOrderRequest(s, "PRIS-2026", 2, ids.order);
  clearOtherOrderRequests(s, null);
  assert.equal(s.length, 1);
});
test("unknown attempt retains its original revision and key until a known result, without QR or recipient storage", () => {
  const s = storage();
  const first = beginAttemptRequest(
    s,
    "PRIS-2026",
    1,
    ids.order,
    1,
    ids.attempt,
  );
  assert.deepEqual(
    beginAttemptRequest(s, "PRIS-2026", 1, ids.order, 2, ids.item),
    first,
  );
  assert.deepEqual(readAttemptRequest(s, "PRIS-2026", 1, ids.order), {
    key: ids.attempt,
    expectedOrderRevision: 1,
    previousAttemptId: null,
  });
  acknowledgeAttemptRequest(s, "PRIS-2026", 1, ids.order, ids.item);
  assert.ok(readAttemptRequest(s, "PRIS-2026", 1, ids.order));
  acknowledgeAttemptRequest(s, "PRIS-2026", 1, ids.order, ids.attempt);
  assert.equal(readAttemptRequest(s, "PRIS-2026", 1, ids.order), null);
  beginAttemptRequest(s, "PRIS-2026", 1, ids.order, 2, ids.item);
  clearOtherOrderRequests(s, null);
  assert.equal(s.length, 0);
});
test("corrupt confirmation metadata fails closed instead of discarding an unknown order", () => {
  const s = storage();
  beginOrderRequest(s, "PRIS-2026", 1, ids.item);
  s.setItem(
    s.key(0)!,
    JSON.stringify({
      key: ids.item,
      eventCode: "PRIS-2026",
      recipient: "must never be persisted",
    }),
  );
  assert.throws(() => readOrderRequest(s, "PRIS-2026", 1));
  assert.throws(() => beginOrderRequest(s, "PRIS-2026", 1, ids.order));
});

test("concurrent recovery reads coalesce while each consumer still checks its owner scope", async () => {
  const s = storage();
  beginOrderRequest(s, "PRIS-2026", 1, ids.item);
  let calls = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const api = createMerchandiseApi({
    fetcher: async () => {
      calls++;
      await held;
      return Response.json({
        success: true,
        data: {
          state: "completed",
          orderId: ids.order,
          error: null,
          serverNow: now,
        },
      });
    },
  });
  let firstCurrent = true;
  const options = {
    storage: s,
    eventCode: "PRIS-2026",
    buyerId: 1,
    token: "synthetic",
    api,
    isCurrent: () => true,
  };
  const first = recoverOrderRequest({
    ...options,
    isCurrent: () => firstCurrent,
  });
  const second = recoverOrderRequest(options);
  firstCurrent = false;
  release();
  assert.deepEqual(await first, { kind: "cancelled" });
  assert.deepEqual(await second, {
    kind: "completed",
    orderId: ids.order,
    key: ids.item,
  });
  assert.equal(calls, 1);
  assert.ok(readOrderRequest(s, "PRIS-2026", 1));
});

test("an old expired attempt cannot acknowledge an uncertain reissue, including legacy metadata", () => {
  const record = {
    key: ids.item,
    expectedOrderRevision: 1,
    previousAttemptId: ids.attempt,
  };
  const old = {
    state: "qr_expired_open",
    attempt: { id: ids.attempt, creationStatus: "issued" },
  } as PaymentView;
  assert.equal(attemptResultKnown(record, old), false);
  assert.equal(
    attemptResultKnown({ key: ids.item, expectedOrderRevision: 1 }, old),
    false,
  );
  assert.equal(
    attemptResultKnown(record, {
      ...old,
      attempt: { ...old.attempt!, id: ids.order },
    }),
    true,
  );
  assert.equal(
    attemptResultKnown(record, {
      ...old,
      state: "verification_unknown",
      attempt: { ...old.attempt!, id: ids.order },
    }),
    false,
  );
  assert.equal(attemptResultKnown(record, { ...old, state: "paid" }), true);
});
