# PRIS2026 incumbent visual system

## Current ticket reference — orange with outlined notches

Follow code (2).html / screen (3).png for the ticket only: white/#fafafa surfaces, black 2px frame, #ea580c accents, bold installed fonts, black confirmation, venue panel and framed QR. Keep shared Header unchanged and retain 9:16. Both middle cutouts mask the straight outer border and draw inward arcs with the same 2px black stroke. CSS pseudo-elements are decorative; real registration QR and PNG download remain. Verified synthetic data at 320px: no information/page overflow, QR contained and exact 9:16. ESLint/TypeScript passed. Screenshots remain local under ignored .impeccable. This reference supersedes earlier ticket color guidance below.

## Current visual authority — existing profile family

The ticket now follows the existing profile palette and typography: #f4f6f8 ground, white card, slate text/QR, blue action and tier, emerald confirmation, inherited Noto Sans Thai/Outfit. Labels have a 10px floor and values a 12px floor. Detailed source audit and rationale: .impeccable/ticket-style-audit.md. This supersedes earlier reference-specific cream/navy/amber colors. Existing 9:16 geometry and data layout remain.

## QR frame containment fix

The QR frame now uses the smaller available dimension of its size container, rather than forcing height to determine its width. Short event/tier text previously left a tall QR region and could make the frame wider than the ticket. Verified synthetic short labels at 320, 390 and 440px: frames stay square and inside the 9:16 card. Focused ESLint and TypeScript passed. Screenshot: .impeccable/screenshots/ticket-qr-contained-mobile.png. Header/title at scroll zero do not overlap; fixed Header covers scrolling content normally.

## Current ticket fields — requested row layout

Removed the NO. label and decorative VERIFIED stamp. The confirmed badge now shares the event-heading row at the top right. The details grid is: full-width HALL / ROOM; DATE with ATTENDEE; TIER with TICKET NO / REG ID. Venue is shown once. The existing Header, 9:16 card, QR and PNG download remain.

Verified synthetic data at 320px and 390px: cards remain 288×512 and 358×636.44, with no horizontal or information overflow. Field pairs share their respective row positions. Thai and English were checked at 320px. Focused ESLint and TypeScript passed. Screenshot: .impeccable/screenshots/ticket-fields-mobile.png. Temporary QA files and session removed.

## Current ticket refinement — balanced layout and QR PNG

Removed the EVENT PASS / ENTRY SCAN pill. The 9:16 card now uses a content-sized information region and gives remaining space to a larger square QR; the shared Header is unchanged. Compact labels and a short confirmed badge avoid wasted space. At 320px, the 288×512 card has no information or horizontal overflow, with a 150px QR SVG; longer data retains the scroll fallback. The duplicated venue summary is hidden below 375px while the venue field remains visible.

Download QR (PNG) replaces save/print. The installed QRCodeCanvas renders the selected regCode at 1024px on white with four quiet-zone modules; a native download saves PRIS2026-QR.png, with a localized failure alert. Actual button download verified as a 1024×1024 PNG. Focused ESLint, TypeScript and production build passed. Screenshots use synthetic QA data; temporary QA files/session/service worker removed. Staff scanning and real LINE devices remain unverified. Earlier print and fixed-grid descriptions below are historical.

## Current ticket sizing — 9:16

Latest user instruction: the ticket itself must keep a 9:16 aspect ratio, with the existing shared Header/logo restored. This overrides the preceding ticket-only wordmark decision. The E-Stub visual treatment, real QR/no barcode and controls remain. Article uses native CSS aspect-ratio and constrained grid rows; text scales with container width. The information region can scroll for long content or a narrow screen without distorting the ticket or dropping registration fields.

Verified synthetic fixtures at 320, 390 and 420px viewport widths: cards measured 288×512, 358×636.44 and 388×689.77 (9:16 within pixel rounding), with no horizontal page overflow. Header original logo and QR dialog Escape/focus return verified. Focused lint and TypeScript pass. Actual scanner/LINE-device behavior remains unverified.

## Current ticket direction — HTML E-Stub reference

The latest user request supersedes earlier ticket composition, header, palette, and single-screen restrictions. Match the supplied code.html and screen (1).png as an event E-Stub, with no barcode. The ticket uses a 420px column, pale #F4F7FB ground, warm-white upper stub, navy #0E2238, amber labels, verified stamp, two-column actual API details, a perforated seam, and a framed real QR below. Ticket-route Header wordmark is PRIS in navy and 2026 in sky blue; other routes keep their original logo. Existing fonts and functioning navigation are retained.

Production data supplies registration number, event name, venue, dates, attendee, tier and confirmed status. Do not copy demo values, the decorative fake QR, centered QR logo, barcode, or fake assistant button from the reference. QR encodes raw regCode with four-module quiet zone. Save/print E-Stub opens the browser print dialog with a ticket-only print stylesheet; PDF saving depends on the browser’s native print support. No new library or backend endpoint.

Focused lint, TypeScript, production build and ticket-reader test passed. Desktop and 420px reference-width screenshots use synthetic QA data; 320px had no horizontal overflow. QR dialog Escape/focus return verified. Print/PDF output, staff scanning and real LINE devices were not exercised. Temporary QA fixture, session and service worker removed.

Historical records follow; the current direction above takes precedence.

This file records existing visual authority for the approved ticket extension. It does not replace the site identity. Evidence: src/app/layout.tsx, src/app/globals.css, src/app/[locale]/profile/page.tsx, src/app/[locale]/login/page.tsx, and existing logo assets.

The latest user request replaces the compact pass with a longer boarding-pass silhouette: navy identity cap, gold divider, green confirmed pill, a dashed seam with side cutouts and a Ticket icon, a flexible white QR body, and a navy event stub. Use incumbent navy/gold values for continuity. Retain the shared Header and fonts; Footer stays hidden on the ticket route only (the existing login/signup exclusions remain). The boarding-pass reference concerns shape, not flight content: do not invent boarding, gate, seat, or flight fields.

## Typography

- Thai: Noto Sans Thai, the existing next/font/google installation. Preserve the locale-th rule that removes wide tracking from Thai labels.
- Latin: Outfit, the existing site font.
- Use the existing font variables; do not add a font dependency.
- General operational body text should be 14-16 px, with comfortable Thai line height. The ticket uses 20 px identity/title text, 14 px ticket name/code/action text, and 12 px status, scan instruction, event rows, and optional details. Essential identity and status remain explicit text.

## Colors

| Role                     | Existing value | Source                   |
| ------------------------ | -------------- | ------------------------ |
| Navy identity            | #0d1f4a        | Profile typography       |
| Dark navy surface/QR ink | #0f172a        | Profile slate-900 and QR |
| Page ground              | #f4f6f8        | Profile page             |
| White surface            | #ffffff        | Profile and login        |
| Gold accent              | #ca9b52        | globals.css color-gold   |
| Blue action accent       | #2563eb        | Profile blue-600         |
| Confirmed status text    | #047857        | Profile emerald-700      |

Use navy, white, and the light page ground as the main operational surfaces. Gold can mark branding or dividers; do not use gold as small body text on white. Status uses text as well as color.

## Surface and component language

The existing account pages combine white rounded surfaces, navy panels, light borders, and restrained shadows. Continue that grammar. Ticket geometry may use one quiet seam, while controls retain a clear button silhouette. Keep imagery and decorative gradients out of the QR scanning area.

## QR and operational content

- The QR is dark ink on opaque white, with a quiet zone of at least four modules.
- Do not round QR modules, place a logo over the code, or animate the QR.
- Registration status means the API registration is confirmed. It does not mean the attendee has already checked in.
- Core text, QR, and controls will be semantic UI and qrcode.react; generated design comps are visual references only.
- Use actual API event content in production. Demo names and registration codes in design comps are explicitly synthetic.

## Responsive and interaction baseline

The long ticket column is capped at 300 px, with 12 px page side padding on small screens. The ticket minimum height follows `clamp(460px, calc(100svh - 280px), 560px)`; this is a minimum, not a clipping limit. Content wraps; do not clip names or registration codes to force a fixed screen height. Touch targets remain at least 44 px. QR enlargement uses a native dialog with browser-managed focus on close.

The implemented ticket surface (`src/app/[locale]/ticket/page.tsx`) places a navy identity cap above a dashed seam with side cutouts and a centered Ticket icon. A flexible white body centers the primary QR, registration code, and scan instruction; the QR wrapper is at most 200 px wide, with qrcode.react retaining four quiet-zone modules. A navy event stub carries icon-led API date/venue rows. Enlargement is a full-width 44 px minimum action, followed by a paired profile/registration row with 44 px minimum targets. Optional API details use native, initially collapsed disclosure. The shared Header remains unchanged; Footer retains its exact ticket-route exclusion and existing login/signup exclusions.

Latest long-pass fixture: at 390 × 844 px, the ticket measured 300 × 560 px, primary actions fit, and there was no horizontal overflow. Shorter phones, long content, multiple registrations, expanded details, or text zoom may require vertical scrolling. Real LINE reopening and venue scanner checks remain unverified.

Long-pass verification: focused lint and typecheck passed; the design detector reported no findings. The 320 px fixture had no horizontal overflow, QR-dialog Escape/focus return passed, and review accepted the revision with no material findings.

Historical compact revision (superseded by the long-pass request): the column was capped at 380 px and the primary QR wrapper adapted from 144 to 200 px. Its 330 × 717 px fixture placed the collapsed details summary bottom at 695.75 px without horizontal overflow; at 390 × 844 px the bottom was 748.75 px. Production build, native disclosure, and QR-dialog Escape/focus return passed for that revision; reviewer reported no material findings for its 330 × 717 px fixture. These results do not certify the latest long-pass revision.
