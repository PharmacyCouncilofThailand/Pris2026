# LINE OA ticket: approved mobile composition

The initial approval of composition B on 2026-10-02 carried a now-superseded ticket-treatment restriction: use only its ticket layout and arrangement; do not copy the image's header or colors. The flow/API in 2026-10-02-line-oa-ticket-flow-design.md remains approved. This specification records the initial decision and latest superseding visual request. Implementation is in `src/app/[locale]/ticket/page.tsx`; device verification remains separate.

## Latest binding request (2026-10-02)

The latest user request supersedes the earlier composition-only approval: match reference B's ticket visuals while retaining the existing shared Header/Footer, language switch, real logo, and installed Noto Sans Thai/Outfit fonts.

- Use a navy #0d1f4a identity panel, gold #ca9b52 divider, green confirmation pill, white QR field, dashed ticket seam, and icon-led date/venue rows.
- Place a full-width navy QR enlargement button and full-width outlined profile action below the ticket. Preserve the centered mobile-first pass and wrapping content.
- Keep production names, dates, venue, ticket type, and QR payload from the authenticated API contract. The mock's demo data, generated header/logo/fonts, and QR drawing remain excluded.
- Auth, event filtering, confirmed-registration ownership, retry/empty/expired-session states, multiple-registration pairing, and raw regCode QR generation remain unchanged. This visual request does not authorize an API or login-flow change.

## Historical approval scope (superseded)

The following records the earlier composition-only decision. Its color and ticket-treatment restrictions are superseded by the latest binding request above; its shared-header and production-data exclusions remain.

- Approved: one vertical ticket; attendee name, ticket type, and registration status above the QR; registration code and scanning instruction under the QR; a quiet ticket seam before event date/location; enlargement and profile actions below the ticket.
- Excluded: the generated site header, generated wordmark, TH/EN control styling, every color sampled from the image, generated font shapes, shadows, gradients, and demo data.
- Keep the existing shared Pris2026 Header and Footer from the locale layout. Use the existing header's language switch and real logo asset; do not add a second ticket-specific header or recreate the image's banner.
- Source colors, typography, button treatments, borders, and status styles from incumbent code, chiefly the current Profile page and globals.css. A similar-looking color is allowed only because it already exists in the site, never because it appears in the generated image.
- The B image is a composition-only reference. User restrictions and source-code design authority take precedence over pixel matching.
- The identity block uses the Profile page's white identity surface and existing status badge; the QR area uses incumbent account-page styles. Preserve the approved vertical reading order.

## Surface brief

- Mode: Operate. A PRIS2026 attendee opens their entry pass from LINE OA on a phone, checks that it belongs to them, and presents the QR to venue staff.
- Success: the screen quickly exposes a server-authorized confirmed registration, its own regCode QR, attendee identity, and ticket type. Event date/location remain available below.
- Identity: match B's ticket treatment with incumbent navy/gold values and fonts; retain the existing shared Header/Footer and real logo.
- Interaction: enlarge the QR through an accessible dialog; switch TH/EN while retaining the journey; keep the existing profile link secondary. On desktop retain a centered readable pass column, rather than introducing a dashboard layout.
- States: loading, confirmed ticket, no matching confirmed ticket, expired session, API failure/retry, optional details absent, and multiple registrations. These states follow the approved flow specification.

## Compositional options

| A: Compact credentials and QR | B: Vertical entry pass | C: Scan focus |
| --- | --- | --- |
| ![A compact credentials and QR](../../../.impeccable/mocks/line-oa-ticket-a.png) | ![B vertical entry pass](../../../.impeccable/mocks/line-oa-ticket-b.png) | ![C scan focus](../../../.impeccable/mocks/line-oa-ticket-c.png) |

A was the unboxed alternative with identity above the QR and the enlargement action near the scanning block. It is retained only as a historical comparison.

B now supplies the approved ticket treatment and vertical reading order, including its navy cap and white QR field. Its generated header remains excluded; use the incumbent palette values and fonts.

C puts the QR before attendee details and uses a compact navy event panel below. It suits repeated presentation to staff; confirming the attendee's name requires looking further down.

A and C remain historical proposals. B's ticket treatment is selected by the latest request; its generated header, logo, fonts, demo details, and QR drawing remain excluded.

## Fidelity and production constraints

- The comps were generated with the built-in image_gen tool. Their complete prompts are embedded in the PNGs and saved in the matching JSON sidecars.
- The name and REG-DEMO-2026 code are synthetic. The QR drawing is a visual placeholder, not an entry credential. The date/location reflect the user's reference; production values come from the API.
- Insert the actual existing PRIS2026 logo asset; do not trace the generated wordmark. Use the installed Noto Sans Thai/Outfit fonts and exact incumbent colors.
- All text, controls, status, and QR will remain semantic UI. No part of these raster mockups is intended to become the actual interactive page.
- The generated comps use an extended portrait to show content below the initial scan block. Reflow for real 320-430 px viewports and text zoom; do not scale the entire image into a fixed-height phone screen.
- Target a roughly 240 px QR on a 390 px viewport with at least four quiet-zone modules; preserve that zone at smaller widths. Use raw regCode through qrcode.react, without logos or stylized modules. The comp's QR drawing/dimensions are illustrative, not the QR-generation contract.
- Use touch targets of at least 44 px, readable Thai labels, visible keyboard focus, and a dialog that restores focus when closed.
- Long attendee names/ticket names wrap; multiple registrations keep their codes and details explicitly paired. Optional session details appear after the primary pass only when the API supplies them.
- Registration-confirmed status is distinct from check-in status. No claim of having checked in appears.

Approval is recorded in the B JSON sidecar with its explicit exclusions. The implementation plan must preserve the existing shared Header/Footer and apply the approved ticket arrangement using incumbent styling.
