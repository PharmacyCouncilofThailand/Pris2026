# Lucky wheel — approved activity ticket B

Mode: Operate. Target: src/app/[locale]/lucky-wheel/page.tsx. Related: src/components/lucky-wheel, src/lib/luckyWheel.ts, messages/th.json, messages/en.json.

Approved by the user on 2026-10-03 with “แบบ B”. Reference: .impeccable/mocks/lucky-wheel-b.png; its .json sidecar records approval and the exact generation prompt. The functional specification is docs/superpowers/specs/2026-10-03-lucky-wheel-design.md.

Job: a logged-in PRIS attendee opens from LINE OA, verifies today's Main Session attendance, spins once and retrieves an owned reward proof for admin collection. Mobile first, TH/EN, 320px through desktop.

Composition: original site Header, wheel/history navigation, one continuous white activity ticket with centered title and eligibility line, wheel, fairness explanation, orange dashed seam with inward circular notches, primary action, then availability rows/history/rules. All ticket content grows naturally; no fixed 9:16 constraint and no sticky-bottom action dock from option C.

Component grammar: 2px near-black frame, approximately 22px outer corners, orange top rule and primary action, white/#fafafa surfaces, moderate rounding on controls, restrained elevation. Noto Sans Thai and Outfit from existing app variables. One title tier (roughly 24–28px at mobile), 14–16px body and controls, 12px minimum secondary copy. Thai has normal tracking. Color values come from current ticket CSS; adapt foreground/button contrast as needed rather than tracing an inaccessible raster.

| Ingredient / commitment | Implementation medium |
| --- | --- |
| Header/logo/language switch | Existing PRIS components/assets; generated header excluded |
| White ticket, orange strip, frame and notched dashed seam | Semantic HTML/CSS; keep geometry of B |
| Exact equally sized wheel sectors, pointer, zero-stock gray states | SVG geometry and semantic text/list, stable segment IDs |
| Wheel rotation | Result-driven CSS transform or installed GSAP; never determines the result |
| Prize images | Admin-uploaded R2 raster images; sample pen/shirt/mug images excluded |
| No-prize symbol | Existing neutral icon; generated gift icons excluded |
| Main action below seam | Native button, full width, min 48px height, visible focus; exact one primary action |
| Wheel/history navigation | Native links/buttons with clear current state |
| Availability rows and rules | Semantic list and native disclosure, include zero-stock labels |
| Reward proof QR | Existing qrcode.react, opaque white, four-module quiet zone, real server token |
| History/proof/status copy | TH/EN semantic UI with owner-only server data |

Stock changes preserve positions. A winning result animates its committed snapshot even if current stock is depleted or admin publishes. All real prizes sold out blocks play despite unlimited no-prize slots. History remains accessible outside spin hours. Missing auth, no check-in today, session closed, paused, updated configuration, unknown network outcome, already played, prize/no-prize, claimed/deadline passed and failed image states are mandatory.

Phone constraints: no clipped Thai names, overflow, pointer hiding the outcome, QR decoration or essential color-only state. With many segments, use matching short identifiers and full text below rather than tiny wedge labels. Support keyboard, status announcements, text zoom and reduced motion. Desktop preserves B's hierarchy within a centered readable column.

No additional visual decisions pending. Prize content, collection point/deadline and R2 credentials are supplied/configured operationally before activation. No real operational values are invented from the mock.

## Verification record — 2026-10-03

The implemented B surface was verified with rendered browser states at 320px Thai, 390px reference comparison, 430px English and desktop, including prize, no-prize, sold-out, history and reward-proof flows. The tested mobile documents had no horizontal overflow; the finishing detector reported no findings, and the final focused frontend tests, scoped ESLint, TypeScript and production build passed.

This browser evidence does **not** certify the separate Task 12 operational gate. Actual LINE iOS/Android login/reopen/refresh, venue camera scanning, rotation interruption, slow-network collection, and actual staging R2 upload/history retention remain separate staging/device/provider checks until they are exercised with the required environment and devices.
