import assert from "node:assert/strict";
import test from "node:test";
import { requestInvitation } from "./sessionInvitation.js";

const token = "a".repeat(64);

function fakeResponse(status: number, body: unknown): Response {
  return {
    status,
    json: async () => body,
  } as Response;
}

test("lookup uses scoped Authorization, no-store GET, and never puts token in URL/body", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;
  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;
    return fakeResponse(200, { invitationId: "id", status: "pending" });
  };

  await requestInvitation("https://api.example.test/", token, null);
  assert.equal(
    capturedUrl,
    "https://api.example.test/api/session-invitations/current",
  );
  assert.equal(capturedUrl.includes(token), false);
  assert.equal(capturedInit?.method, "GET");
  assert.equal(capturedInit?.cache, "no-store");
  assert.equal(capturedInit?.body, undefined);
  assert.equal(
    (capturedInit?.headers as Record<string, string>).Authorization,
    `Bearer ${token}`,
  );
  assert.equal(
    (capturedInit?.headers as Record<string, string>)["Content-Type"],
    undefined,
  );
});

test("response PUT sends only the decision and preserves safe error DTOs", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;
  const safeError = {
    error: "expired",
    code: "INVITATION_EXPIRED",
    invitation: {
      invitationId: "safe-id",
      status: "expired",
      respondedAt: null,
      effectiveDeadline: "2026-10-01T10:00:00.000Z",
      recipientFirstName: "Somchai",
      session: {
        sessionName: "Policy Innovation",
        sessionType: "workshop",
        startTime: "2026-10-01T11:00:00.000Z",
        endTime: "2026-10-01T12:00:00.000Z",
        room: "A",
      },
    },
  };
  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;
    return fakeResponse(410, safeError);
  };

  const result = await requestInvitation(
    "https://api.example.test",
    token,
    "declined",
  );
  assert.equal(result.httpStatus, 410);
  assert.deepEqual(result.body, safeError);
  assert.equal(capturedUrl.includes(token), false);
  assert.equal(capturedInit?.method, "PUT");
  assert.equal(capturedInit?.body, JSON.stringify({ decision: "declined" }));
  assert.deepEqual(Object.keys(JSON.parse(String(capturedInit?.body))).sort(), [
    "decision",
  ]);
});

test("AbortSignal and network failures propagate without logging or rewriting the token", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  const logged: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    logged.push(args);
  };
  const controller = new AbortController();
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.signal, controller.signal);
    throw new Error("synthetic network failure");
  };

  await assert.rejects(
    requestInvitation(
      "https://api.example.test",
      token,
      null,
      controller.signal,
    ),
    /synthetic network failure/,
  );
  assert.deepEqual(logged, []);
});
