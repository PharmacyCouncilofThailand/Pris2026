# LINE OA Ticket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add the existing-auth PRIS2026 ticket journey using B's vertical ticket arrangement and the current website's header and visual styles.

**Architecture:** The OA link opens /th/ticket. Pris2026 restores its existing authentication, returns through login when necessary, and reads owned confirmed tickets from conference-api. This plan adds no backend endpoint, LINE identity integration, or new dependency.

**Tech Stack:** Existing Next.js 16, React 19, next-intl, qrcode.react, native dialog, Tailwind, and tsx/node:test.

## Global Constraints

- User approved B for composition and geometry only.
- Do not copy the generated header or any image-derived color.
- Keep the existing shared Header/Footer and real logo. Add /ticket only to the Header's existing light-page list.
- Source page, identity, QR, status, and button styles from the current Profile page and globals.css.
- Preserve Noto Sans Thai/Outfit, Thai tracking, and existing navigation.
- QR contains raw regCode; no tokens, personal information, logo overlays, or new QR format.
- Existing API ownership and confirmed-registration rules remain authoritative.
- Scope is this single feature; no unrelated auth redesign or abstraction.
- This file records the approved implementation plan; implementation completed on 2026-10-02.
- Execute in the current checkout when authorized; do not create a new worktree or delegate automatically.
- A referenced execution skill must be available before invoking it. The numbered tasks and existing verification commands also provide a complete inline handoff.

All paths below are relative to D:/confer/confer/conference/Pris2026. Authoritative specs are docs/superpowers/specs/2026-10-02-line-oa-ticket-flow-design.md and docs/superpowers/specs/2026-10-02-line-oa-ticket-mobile-design.md. Reference image .impeccable/mocks/line-oa-ticket-b.png is composition-only; its JSON records the exclusions.

---

### Task 1: Ticket reader and return-destination contract

**Files:** Create src/lib/entryTicket.ts and src/lib/entryTicket.test.ts.
**Consumes:** Existing API_URL, PRIS token, configured event code, and AbortSignal.
**Produces:** EntryTicket, loadEntryTickets(), and ticketReturnQuery() for navigation and page rendering.

- [ ] Add this focused check to src/lib/entryTicket.test.ts and run it first with npx --no-install tsx --test src/lib/entryTicket.test.ts. Expect a missing-module failure.

~~~ts
import assert from "node:assert/strict";
import test from "node:test";
import { loadEntryTickets, ticketReturnQuery } from "./entryTicket.js";

test("ticket journey retains a safe destination, reads owned confirmed PRIS data, and preserves failures", async () => {
  assert.deepEqual(ticketReturnQuery("?redirect=%2Fth%2Fticket"), { redirect: "/ticket" });
  assert.equal(ticketReturnQuery("?redirect=https%3A%2F%2Fevil.test"), undefined);
  assert.equal(ticketReturnQuery("?redirect=%2Fprofile"), undefined);
  const originalFetch = globalThis.fetch;
  const row = { registrationId: 1, regCode: "REG-DEMO", eventCode: "PRIS-2026",
    status: "confirmed", ticketName: "Early Bird", eventStartDate: null,
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
~~~

- [ ] Create src/lib/entryTicket.ts with the complete implementation below. It validates the core QR contract instead of treating malformed data as an empty ticket. Optional labels are presentation data and never grant access.

~~~ts
import { normalizeLocalizedRedirectPath } from "./localizedRedirect";

export interface EntryTicket {
  registrationId: number;
  regCode: string;
  ticketName: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventLocation: string | null;
  details: string[];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function ticketReturnQuery(search: string): { redirect: "/ticket" } | undefined {
  return normalizeLocalizedRedirectPath(new URLSearchParams(search).get("redirect")) === "/ticket"
    ? { redirect: "/ticket" } : undefined;
}

export async function loadEntryTickets(
  apiOrigin: string, token: string, eventCode: string, signal?: AbortSignal,
): Promise<EntryTicket[]> {
  const response = await fetch(apiOrigin.replace(/\/$/, "") + "/api/payments/my-tickets", {
    headers: { Accept: "application/json", Authorization: "Bearer " + token },
    cache: "no-store", signal,
  });
  if (!response.ok) throw new Error("Ticket request failed", { cause: response.status });
  const body: unknown = await response.json();
  if (!record(body) || body.success !== true || !Array.isArray(body.data)) {
    throw new Error("Invalid ticket response");
  }
  return body.data.filter((row) => record(row) && row.eventCode === eventCode && row.status === "confirmed")
    .map((value) => {
      const row = value as Record<string, unknown>;
      if (typeof row.registrationId !== "number" || !Number.isInteger(row.registrationId)
        || row.registrationId < 1 || typeof row.regCode !== "string" || !row.regCode.trim()
        || typeof row.ticketName !== "string" || !row.ticketName.trim()) {
        throw new Error("Invalid confirmed registration");
      }
      const labels: unknown[] = Array.isArray(row.includes) ? [...row.includes] : [];
      for (const key of ["workshops", "adminGrantedSessions"]) {
        const sessions = row[key];
        if (Array.isArray(sessions)) for (const session of sessions) {
          if (record(session)) labels.push(session.sessionName || session.name);
        }
      }
      if (record(row.galaTicket)) labels.push(row.galaTicket.name);
      return {
        registrationId: row.registrationId, regCode: row.regCode, ticketName: row.ticketName,
        eventStartDate: typeof row.eventStartDate === "string" ? row.eventStartDate : null,
        eventEndDate: typeof row.eventEndDate === "string" ? row.eventEndDate : null,
        eventLocation: typeof row.eventLocation === "string" ? row.eventLocation : null,
        details: [...new Set(labels.filter((label): label is string => typeof label === "string" && !!label.trim()))],
      };
    });
}
~~~

- [ ] Run the focused check again; expect PASS. Commit only these two feature files.

### Task 2: Preserve the ticket journey through auth and refresh

**Files:** Modify src/lib/refreshRedirect.ts, src/lib/refreshRedirect.test.ts, src/components/layout/GlobalRefreshRedirect.tsx; src/app/[locale]/login/page.tsx; src/app/[locale]/signup/page.tsx; src/app/[locale]/signup/{student,pharmacist,healthcare,pending}/page.tsx.
**Consumes:** ticketReturnQuery() and the existing localized redirect helper.
**Produces:** Stable ticket/login refreshes and retained ticket destination across existing auth links and locale switches.

- [ ] Append this check to src/lib/refreshRedirect.test.ts. Run the existing refresh and localized redirect checks; the new check must fail before the edit.

~~~ts
test("ticket and ticket-directed auth reloads stay in the journey", () => {
  for (const path of ["/ticket", "/th/ticket", "/en/ticket/"]) {
    assert.equal(shouldRedirectReload(path), false);
  }
  for (const path of ["/th/login", "/signup/student", "/en/signup/pending"]) {
    assert.equal(shouldRedirectReload(path, "?redirect=%2Fticket"), false);
  }
  assert.equal(shouldRedirectReload("/login"), true);
  assert.equal(shouldRedirectReload("/login", "?redirect=%2Fprofile"), true);
  assert.equal(shouldRedirectReload("/profile"), true);
});
~~~

- [ ] Replace src/lib/refreshRedirect.ts with:

~~~ts
import { ticketReturnQuery } from "./entryTicket";

export function shouldRedirectReload(pathname: string, search = ""): boolean {
  const normalized = pathname.replace(/^\/(th|en)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  if (["/", "/sessions/confirm", "/ticket"].includes(normalized)) return false;
  const authJourney = normalized === "/login" || normalized === "/signup" || normalized.startsWith("/signup/");
  return !(authJourney && ticketReturnQuery(search));
}
~~~

In GlobalRefreshRedirect, replace only the predicate call, preserving the component's existing behavior:

~~~ts
shouldRedirectReload(pathname, window.location.search)
~~~

- [ ] In login, signup, student, pharmacist, healthcare, and pending pages, replace the existing locale-switch router.replace() call with:

~~~ts
router.replace(
  { pathname, query: Object.fromEntries(new URLSearchParams(window.location.search).entries()) },
  { locale: nextLocale },
);
~~~

- [ ] Add this import to login and the signup pages whose links are being changed:

~~~ts
import { ticketReturnQuery } from "@/lib/entryTicket";
~~~

For each auth link named below, keep its current classes/copy and replace just href using this exact form (the pathname remains its existing constant):

~~~tsx
href={{
  pathname: "/signup",
  query: ticketReturnQuery(typeof window === "undefined" ? "" : window.location.search),
}}
~~~

Apply to login → /signup; signup → /signup/student, /signup/pharmacist, /signup/healthcare, /login; each role form → /signup back links and /login links. Pending has no login link in the current UI: preserve its existing home link rather than adding a new control.

- [ ] In the signup index and role forms, update the existing authenticated-user effect's router.replace("/") destination, which can otherwise race with the successful registration redirect:

~~~ts
router.replace(normalizeLocalizedRedirectPath(new URLSearchParams(window.location.search).get("redirect")));
~~~

The role forms already import normalizeLocalizedRedirectPath; add the same import to the signup index:

~~~ts
import { normalizeLocalizedRedirectPath } from "@/lib/localizedRedirect";
~~~

Keep successful registration's existing redirect normalization and account-status handling. When an existing role form routes to /signup/pending, replace the route argument with:

~~~ts
{
  pathname: "/signup/pending",
  query: ticketReturnQuery(window.location.search),
}
~~~

- [ ] Run npx --no-install tsx --test src/lib/entryTicket.test.ts src/lib/refreshRedirect.test.ts src/lib/localizedRedirect.test.ts; expect PASS. Verify an ordinary login/registration without a ticket redirect retains its current destination and account rules. Commit these narrow auth/navigation edits together.

### Task 3: Mobile pass using B's geometry and existing site styles

**Files:** Create src/app/[locale]/ticket/page.tsx; modify messages/th.json, messages/en.json, and src/components/layout/Header.tsx.
**Consumes:** Existing AuthProvider, loadEntryTickets(), existing profile endpoint, and existing locale layout.
**Produces:** Confirmed/empty/loading/error ticket states, paired multi-ticket selection, and native QR enlargement.

- [ ] Add "/ticket" to Header.tsx's lightPages array. Keep Header, Footer, locale layout, logo, and header controls otherwise as they are. The ticket page starts below the existing fixed header.

- [ ] Add this root-level ticket message namespace to each JSON file. Preserve every existing namespace.

~~~json
{
  "th": {
    "title": "บัตรเข้าร่วมงาน", "confirmed": "ยืนยันการลงทะเบียนแล้ว",
    "loading": "กำลังโหลดบัตรเข้าร่วมงาน", "loadError": "โหลดบัตรไม่สำเร็จ กรุณาลองใหม่",
    "empty": "ยังไม่พบบัตรที่ยืนยันสำหรับงานนี้",
    "emptyHint": "ตรวจสอบการลงทะเบียนหรือสถานะการยืนยันในบัญชีของคุณ",
    "retry": "ลองใหม่", "profile": "ดูโปรไฟล์", "registration": "ตรวจสอบการลงทะเบียน",
    "enlarge": "ขยาย QR", "close": "ปิด", "scan": "แสดง QR นี้ให้เจ้าหน้าที่สแกน",
    "code": "รหัสลงทะเบียน", "type": "ประเภทบัตร", "select": "เลือกบัตรเข้าร่วมงาน",
    "date": "วันจัดงาน", "venue": "สถานที่", "notAvailable": "ยังไม่มีข้อมูล",
    "attendee": "ผู้เข้าร่วมงาน", "details": "รายละเอียดสิทธิ์การเข้าร่วม",
    "qrAlt": "QR สำหรับรหัสลงทะเบียน {code}", "configuration": "ยังไม่ได้กำหนดข้อมูลงาน"
  },
  "en": {
    "title": "Entry ticket", "confirmed": "Registration confirmed",
    "loading": "Loading your entry ticket", "loadError": "Could not load your ticket. Please try again.",
    "empty": "No confirmed ticket found for this event",
    "emptyHint": "Check your registration and confirmation status in your account.",
    "retry": "Try again", "profile": "View profile", "registration": "Check registration",
    "enlarge": "Enlarge QR", "close": "Close", "scan": "Show this QR to event staff",
    "code": "Registration code", "type": "Ticket type", "select": "Choose entry ticket",
    "date": "Event date", "venue": "Venue", "notAvailable": "Not provided",
    "attendee": "Attendee", "details": "Participation details",
    "qrAlt": "QR for registration {code}", "configuration": "Event configuration is missing"
  }
}
~~~

The th object becomes messages/th.json's ticket value; the en object becomes messages/en.json's ticket value. They are not language objects inside the runtime namespace.

- [ ] Create the complete ticket page below. This code intentionally takes colors and classes from the current Profile page rather than the mock. QR modules/quiet zone use qrcode.react, never the generated drawing.

~~~tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { loadEntryTickets, type EntryTicket } from "@/lib/entryTicket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const EVENT_CODE = process.env.NEXT_PUBLIC_EVENT_CODE;

export default function TicketPage() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ticket");
  const dialog = useRef<HTMLDialogElement>(null);
  const [attempt, setAttempt] = useState(0);
  const requestKey = (token || "") + ":" + attempt;
  const [result, setResult] = useState<{ key: string; tickets?: EntryTicket[]; error?: boolean } | null>(null);
  const [profile, setProfile] = useState<{ token: string; name: string } | null>(null);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login?redirect=%2Fticket");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !token || !EVENT_CODE) return;
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => controller.abort(), 15_000);
    const expire = () => {
      logout();
      router.replace("/login?redirect=%2Fticket");
    };
    loadEntryTickets(API_URL, token, EVENT_CODE, controller.signal)
      .then((tickets) => {
        if (!cancelled) setResult({ key: requestKey, tickets });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof Error && error.cause === 401) expire();
        else setResult({ key: requestKey, error: true });
      });
    fetch(API_URL.replace(/\/$/, "") + "/api/users/profile", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store", signal: controller.signal,
    }).then(async (response) => {
      if (cancelled) return;
      if (response.status === 401) { expire(); return; }
      if (!response.ok) return;
      const body = await response.json();
      if (cancelled || !body.success || body.user?.id !== user?.id) return;
      const name = [body.user.firstName, body.user.lastName]
        .filter((part: unknown) => typeof part === "string" && part.trim()).join(" ");
      if (name) setProfile({ token, name });
    }).catch(() => {});
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [isAuthenticated, token, user?.id, requestKey, logout, router]);

  if (!isAuthenticated) return null;
  const current = result?.key === requestKey ? result : null;
  const tickets = current?.tickets || [];
  const ticket = tickets.find((row) => String(row.registrationId) === selectedId) || tickets[0];
  const name = (profile?.token === token ? profile.name : "")
    || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || t("attendee");
  const date = (value: string | null) => {
    if (!value) return t("notAvailable");
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? t("notAvailable")
      : new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
        dateStyle: "medium", timeZone: "Asia/Bangkok",
      }).format(parsed);
  };
  const action = "inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600";
  const links = (
    <div className="flex flex-wrap justify-center gap-4">
      <Link href="/profile" className="inline-flex min-h-11 items-center text-sm font-bold text-blue-600 underline underline-offset-4">{t("profile")}</Link>
      <Link href="/registration" className="inline-flex min-h-11 items-center text-sm font-bold text-blue-600 underline underline-offset-4">{t("registration")}</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-4 pb-12 pt-24 text-slate-900 sm:px-6">
      <div className="mx-auto w-full max-w-[480px]">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        {!EVENT_CODE ? (
          <p role="alert">{t("configuration")}</p>
        ) : !current ? (
          <p role="status" aria-live="polite" className="py-12 text-center">{t("loading")}</p>
        ) : current.error ? (
          <div className="space-y-5 rounded-3xl bg-white p-6 text-center">
            <p role="alert">{t("loadError")}</p>
            <button className={action} onClick={() => setAttempt((value) => value + 1)}>{t("retry")}</button>
          </div>
        ) : !ticket ? (
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-center">
            <h2 className="text-lg font-bold">{t("empty")}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{t("emptyHint")}</p>
            {links}
          </div>
        ) : (
          <>
            {tickets.length > 1 && (
              <label className="mb-4 block text-sm font-semibold">
                {t("select")}
                <select value={String(ticket.registrationId)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
                  onChange={(event) => { dialog.current?.close(); setSelectedId(event.target.value); }}>
                  {tickets.map((row) => <option key={row.registrationId} value={row.registrationId}>{row.ticketName + " — " + row.regCode}</option>)}
                </select>
              </label>
            )}
            <article className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40">
              <div className="p-6 text-center">
                <h2 className="break-words text-2xl font-bold leading-relaxed">{name}</h2>
                <p className="mt-2 break-words text-sm font-semibold text-blue-600">{t("type") + ": " + ticket.ticketName}</p>
                <p className="mt-4 inline-flex max-w-full items-center rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{t("confirmed")}</p>
              </div>
              <div className="flex flex-col items-center gap-4 bg-slate-900 px-5 py-6 text-white">
                <div className="w-full max-w-[240px] rounded-xl bg-white p-3">
                  <QRCodeSVG value={ticket.regCode} size={240} level="M" marginSize={4}
                    bgColor="#ffffff" fgColor="#0f172a" className="h-auto w-full"
                    role="img" aria-label={t("qrAlt", { code: ticket.regCode })} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-300">{t("code")}</p>
                  <p className="mt-1 break-all font-mono text-base font-bold">{ticket.regCode}</p>
                </div>
                <p className="text-center text-sm leading-relaxed text-slate-300">{t("scan")}</p>
              </div>
              <dl className="relative grid gap-4 border-t border-dashed border-slate-300 p-6 text-sm before:absolute before:-left-3 before:-top-3 before:h-6 before:w-6 before:rounded-full before:bg-[#f4f6f8] after:absolute after:-right-3 after:-top-3 after:h-6 after:w-6 after:rounded-full after:bg-[#f4f6f8]">
                <div><dt className="text-slate-500">{t("date")}</dt><dd className="mt-1 font-semibold">{date(ticket.eventStartDate) + (ticket.eventEndDate && date(ticket.eventEndDate) !== date(ticket.eventStartDate) ? " – " + date(ticket.eventEndDate) : "")}</dd></div>
                <div><dt className="text-slate-500">{t("venue")}</dt><dd className="mt-1 break-words font-semibold">{ticket.eventLocation || t("notAvailable")}</dd></div>
              </dl>
            </article>
            <button className={action + " mt-5 w-full"} onClick={() => dialog.current?.showModal()}>{t("enlarge")}</button>
            <div className="mt-3">{links}</div>
            {ticket.details.length > 0 && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="font-bold">{t("details")}</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                  {ticket.details.map((label) => <li key={label}>{label}</li>)}
                </ul>
              </section>
            )}
            <dialog ref={dialog} aria-labelledby="ticket-qr-heading" className="m-auto w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-5 text-slate-900 backdrop:bg-black/60">
              <h2 id="ticket-qr-heading" className="mb-4 text-lg font-bold">{t("enlarge")}</h2>
              <QRCodeSVG value={ticket.regCode} size={360} level="M" marginSize={4} bgColor="#ffffff" fgColor="#0f172a"
                className="h-auto w-full" role="img" aria-label={t("qrAlt", { code: ticket.regCode })} />
              <p className="my-4 break-all text-center font-mono font-bold">{ticket.regCode}</p>
              <form method="dialog"><button autoFocus className={action + " w-full"}>{t("close")}</button></form>
            </dialog>
          </>
        )}
      </div>
    </main>
  );
}
~~~

- [ ] Confirm the existing Header, Footer, real logo, language control, and fonts render normally. No mock header is added. Compare B only for identity → QR → seam/event details → actions order.
- [ ] Run the focused tests, then npm run lint and npm run build once. Record any baseline failures separately from this feature; fix feature failures before proceeding. Commit the page, messages, and the one Header classification change.

### Task 4: Bounded browser and real-LINE verification

**Files:** Update this plan's checkboxes and the approved specs only if verification exposes a factual correction.
**Consumes:** Built ticket route and current auth/API behavior.
**Produces:** Evidence for the acceptance cases, without deployment or OA configuration being silently changed.

- [ ] Use the existing npm run dev command. Inspect desktop and 390 px mobile together, and include 320 px width/text zoom in the same pass.
- [ ] Check B's vertical structure while comparing visual treatment against the incumbent Profile page and Header. Ensure colors came from code, not from the generated image.
- [ ] Check valid login, remembered reopening, 401/expiry/logout, refresh, TH/EN switching, and signup links that carry the ticket destination. Verify pending/rejected account policy is unchanged.
- [ ] Check empty API data, wrong event, multiple registrations, long names/labels, partial profile failure, failed/slow ticket request, missing dates/location, and optional session labels. Never show a fake QR or checked-in state.
- [ ] Check keyboard focus, native dialog open/Escape/close/focus return, and hidden stale QR on authentication change.
- [ ] Scan the raw regCode QR through the existing staff backoffice. Verify the API registration and session entitlements determine access.
- [ ] On actual iOS and Android LINE, verify login/Turnstile, close/reopen with remember-me on/off, session expiry, browser switching, QR enlargement, and narrow viewports. Record these as pending real-device checks if no device access exists; do not claim them passed from desktop testing.
- [ ] Apply Impeccable's existing build verification instructions: one batched desktop/mobile inspection, one batch of fixes, and at most one confirmation pass. Run its mechanical detector once on changed UI files. Its required finish reviewer receives this user's composition-only restriction explicitly; pixel matching of the excluded header/colors is not an acceptance criterion.
- [ ] Report the implemented route, checks actually run, and any outstanding real-client limitation. Configure the OA URI only when the deployed PRIS origin and OA access are available and authorized. Use /th/ticket; no user token enters that URL.

## Self-review and stopping condition

The plan covers existing auth hydration, JWT rejection, safe return destination, refresh exceptions, locale switching, API ownership reuse, confirmed-only QR, all primary states, multiple tickets, optional labels, native enlargement, incumbent header/colors, and small-screen verification. No dependency, backend endpoint, or unrelated auth policy change is included.

Stop feature work when these tasks and applicable checks pass. This design/planning request itself ends with the approved B constraints and this saved plan; implementation proceeds when requested.

## Implementation verification — 2026-10-02

Implemented `/th/ticket` and `/en/ticket` using existing auth/API, B composition only, incumbent Header/Footer/colors/fonts. No backend endpoint or dependency added.

- All 44 repository tests pass, including ticket ownership-request/confirmed-event filtering/failure and safe return/refresh checks.
- Production build passes; initial sandbox attempt could not fetch existing Google fonts, then approved network-enabled build passed.
- Focused ESLint on all changed TS/TSX files passes. Full project lint has 21 existing errors and 11 warnings outside this feature.
- Impeccable detector returned `[]`; fresh finish reviewer disposition **Pass**, no material findings.
- Local browser with temporary synthetic fixtures verified desktop, 390px and 320px confirmed layout, no 320px horizontal overflow, selection/paired QR, enlargement, Escape/focus return, refresh, empty state, API error/retry, 401/login return, login language change and ticket destination on signup links.
- Temporary fixture files, simulated auth, and service worker removed after QA. Screenshots are synthetic evidence, not real attendee data.
- Real iOS/Android LINE persistence and Turnstile login, staff scanner integration, text zoom, and extreme content lengths remain unverified. No deployment or OA configuration changed.
