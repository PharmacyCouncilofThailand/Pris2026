# PRIS2026 product context

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

PRIS2026 attendees use the existing website to sign in, register, manage their profile, and access their registration QR. The confirmed LINE OA extension serves attendees opening their ticket from the OA rich menu on a phone, including at the venue entrance.

## Product Purpose

Let an attendee reach their own confirmed PRIS2026 registration ticket through one stable rich-menu URL, using the existing PRIS account and the existing staff check-in system.

## Operating Context

The ticket URL opens as ordinary HTTPS web content. An attendee without a usable PRIS session signs in on PRIS2026 and returns to the ticket. Subsequent visits reuse a valid session. The user accepts another PRIS login when the session expires, storage is cleared, or the browser/device changes; LINE identity linking is outside this phase.

## Capabilities and Constraints

- Extend the existing Next.js/React app and conference-api; reuse existing authentication, ticket readers, and qrcode.react.
- The first release covers the registration-and-ticket rich-menu entry only. Other entries remain ordinary links.
- Use POST /auth/login, GET /api/payments/my-tickets, and GET /api/users/profile. No new API endpoint or LINE account-linking table is required.
- The API selects ticket ownership from the authenticated user and returns confirmed registrations. PRIS2026 selection uses the configured event code.
- The QR payload remains the registration regCode understood by staff check-in.
- Existing PRIS tokens expire after seven days. Remember-me uses localStorage; unchecked remember-me uses sessionStorage. Reopening behavior must be checked on real iOS and Android LINE clients.
- Thai and English routing already exist. Return-to-ticket navigation must survive language changes and refreshes.

## Brand Commitments

The user explicitly requires the new mobile-first ticket surface to follow the incumbent PRIS2026 fonts, colors, and templates. Retain the existing PRIS2026 logo and the existing Noto Sans Thai/Outfit font system. On 2026-10-02 the user selected mock B only for ticket composition, explicitly excluding its header and every image-derived color. Keep the existing shared site Header/Footer and use source code as the visual authority.

## Evidence on Hand

- src/app/layout.tsx and src/app/globals.css: installed fonts and theme.
- src/app/[locale]/profile/page.tsx: existing attendee QR and identity display.
- src/app/[locale]/login/page.tsx: existing login and redirect behavior.
- public/assets/Img/logo/Logo-Final .png: existing white logo asset.
- ../conference-api/src/routes/payments/index.ts: current-user ticket reader.
- ../conference-api/src/routes/backoffice/checkins.ts: staff validation of regCode, registration, and session access.
- User-provided rich-menu reference: PRIS2026, 29-30 October 2569, IMPACT Muang Thong Thani. Production event dates and location must come from the API.

## Product Principles

- Reuse the registration and authorization rules already enforced by conference-api.
- Keep the rich-menu URL stable; let the website resolve authentication and ticket state.
- Make the QR and registration identity readable on a phone at the venue.
- Show accurate loading, empty, and failure states; do not describe a failed request as a missing ticket.

## Accessibility & Inclusion

The mobile surface must support readable Thai text, keyboard access, sufficiently large touch targets, visible focus, and text labels for status. QR enlargement must remain usable with zoom and small screens.
