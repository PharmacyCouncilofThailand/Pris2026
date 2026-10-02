import assert from "node:assert/strict";
import test from "node:test";
import { loadEntryTickets, prepareTicketDownload, ticketReturnQuery } from "./entryTicket.js";

test("ticket export uploads PNG with bearer auth and accepts only a same-API download path", async () => {
  const originalFetch = globalThis.fetch;
  const png = new Blob(["synthetic PNG"], { type: "image/png" });
  const downloadPath = "/api/ticket-exports/" + "a".repeat(32) + ".1700000000000." + "b".repeat(43);
  try {
    globalThis.fetch = async (input, init) => {
      assert.equal(input, "https://api.example.test/api/ticket-exports/registrations/803");
      assert.equal(init?.method, "POST");
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer qa-token");
      assert.equal(new Headers(init?.headers).get("Content-Type"), "image/png");
      assert.equal(init?.body, png);
      return Response.json({ success: true, path: downloadPath });
    };
    assert.equal(await prepareTicketDownload("https://api.example.test/", "qa-token", 803, png), "https://api.example.test" + downloadPath);
    globalThis.fetch = async () => Response.json({ success: true, path: "https://evil.test/file.png" });
    await assert.rejects(prepareTicketDownload("https://api.example.test", "qa-token", 803, png));
    globalThis.fetch = async () => new Response(null, { status: 401 });
    await assert.rejects(prepareTicketDownload("https://api.example.test", "qa-token", 803, png), (error: unknown) => error instanceof Error && error.cause === 401);
  } finally { globalThis.fetch = originalFetch; }
});

test("ticket journey retains a safe destination, reads owned confirmed PRIS data, and preserves failures", async () => {
  assert.deepEqual(ticketReturnQuery("?redirect=%2Fth%2Fticket"), { redirect: "/ticket" });
  assert.equal(ticketReturnQuery("?redirect=https%3A%2F%2Fevil.test"), undefined);
  assert.equal(ticketReturnQuery("?redirect=%2Fprofile"), undefined);
  const originalFetch = globalThis.fetch;
  const row = { registrationId: 1, regCode: "REG-DEMO", eventCode: "PRIS-2026",
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
