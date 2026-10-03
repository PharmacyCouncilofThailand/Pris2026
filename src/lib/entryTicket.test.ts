import assert from "node:assert/strict";
import test from "node:test";
import { loadEntryTickets, ticketReturnQuery } from "./entryTicket.js";

test("ticket journey retains a safe destination, reads owned confirmed PRIS data, and preserves failures", async () => {
  assert.deepEqual(ticketReturnQuery("?redirect=%2Fth%2Fticket"), { redirect: "/ticket" });
  assert.equal(ticketReturnQuery("?redirect=https%3A%2F%2Fevil.test"), undefined);
  assert.equal(ticketReturnQuery("?redirect=%2Fprofile"), undefined);
  const originalFetch = globalThis.fetch;
  const row = { registrationId: 1, eventId: 7, regCode: "REG-DEMO", eventCode: "PRIS-2026",
    eventName: "PRIS 2026", status: "confirmed", ticketName: "Early Bird", eventStartDate: null,
    eventEndDate: null, eventLocation: "IMPACT", includes: ["Main Stage"] };
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), "https://api.example.test/api/payments/my-tickets");
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-token");
      assert.equal(init?.cache, "no-store");
      return Response.json({ success: true, data: [
        row, { ...row, registrationId: 2, eventCode: "OTHER" },
        { ...row, registrationId: 3, status: "pending" }
      ] });
    };
    const rows = await loadEntryTickets("https://api.example.test/", "test-token", "PRIS-2026");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].regCode, "REG-DEMO");
    assert.equal(rows[0].eventId, 7);
    assert.equal(rows[0].eventName, "PRIS 2026");
    assert.deepEqual(rows[0].details, ["Main Stage"]);
    globalThis.fetch = async () => Response.json({ success: true, data: [] });
    assert.deepEqual(await loadEntryTickets("https://api.example.test", "test-token", "PRIS-2026"), []);
    globalThis.fetch = async () => new Response("", { status: 401 });
    await assert.rejects(loadEntryTickets("https://api.example.test", "test-token", "PRIS-2026"),
      (error: unknown) => error instanceof Error && error.cause === 401);
    globalThis.fetch = async () => Response.json({ success: true, data: [{ ...row, regCode: "" }] });
    await assert.rejects(loadEntryTickets("https://api.example.test", "test-token", "PRIS-2026"));
    globalThis.fetch = async () => { throw new TypeError("offline"); };
    await assert.rejects(loadEntryTickets("https://api.example.test", "test-token", "PRIS-2026"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
