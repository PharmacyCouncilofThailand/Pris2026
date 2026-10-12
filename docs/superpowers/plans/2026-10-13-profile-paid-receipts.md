# PRIS Profile Paid Receipts Implementation Plan

> Execute inline in the current session following the user's approved design.

**Goal:** Display payment documents only for positive paid order totals and simplify signup email labels.

**Architecture:** Add the paid order total to the existing ticket response and gate the existing profile section on it. Reuse the translation key and native email validation.

**Tech Stack:** Next.js, React, TypeScript, Fastify, Drizzle, node:test.

## Tasks

- [x] Add endpoint regression tests in `conference-api/src/routes/payments/my-tickets.test.ts` exercising the actual route with mocked database results: verify list-price compatibility and paid totals for paid, free, discounted, pending, cancelled and absent orders.
- [x] Add profile component tests in `Pris2026/src/lib/profileReceipt.test.ts` using existing TypeScript/VM and React renderer tools: verify positive paid orders with/without documents, hidden zero-value and unpaid tickets, loading/failure, matching event and multiple registrations.
- [x] Add `orderTotalAmount: orders.totalAmount` to the ticket query and `paidAmount: reg.orderStatus === "paid" ? reg.orderTotalAmount : null` to its response in `conference-api/src/routes/payments/index.ts`.
- [x] Update `Pris2026/src/app/[locale]/profile/page.tsx`: declare `paidAmount`, filter by event and positive finite paid amount, hide the section until the result is loaded, and retain ready/unavailable document states.
- [x] Change `Pris2026/messages/th.json` email label to `อีเมล` and remove email asterisks from student/pharmacist/healthcare signup and `SpecialRoleSignUpForm.tsx`, leaving inputs required.
- [x] Run focused API/profile tests, API build, PRIS TypeScript check and focused formatting/diff checks. Record remaining limits.

## Verification

- API ticket-response regression, both profile rendering regression tests, and the existing entry-ticket test passed.
- API build and PRIS TypeScript check passed.
- The Thai translation and all four signup email inputs were checked: labels no longer show an asterisk and inputs remain required.
- Tests use mocked network/database data. No live database checks, receipt generation changes, or deployment were performed. Deploy the API before or alongside PRIS because the page requires the new `paidAmount` field.
