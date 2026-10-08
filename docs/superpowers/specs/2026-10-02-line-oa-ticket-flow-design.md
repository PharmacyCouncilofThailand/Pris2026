# LINE OA ticket: approved flow and API design

Date: 2026-10-02, Asia/Bangkok.

The user approved this architecture in chat: an ordinary URL, existing PRIS authentication, no LIFF/account linking in phase one, and another login when a session expires or browser/device storage changes. This document records that approved scope. The user subsequently selected composition B with header/color exclusions, recorded in 2026-10-02-line-oa-ticket-mobile-design.md.

## Scope and entry

Create /[locale]/ticket in Pris2026. Configure the first rich-menu tap area to the existing PRIS deployment origin followed by /th/ticket. Resolve the actual origin from deployment configuration when configuring the OA; do not place a localhost URL or a user token in the menu.

The URL is identical for every attendee and every visit. Other menu entries are out of this feature's implementation scope. A URI action does not supply an authenticated PRIS account or prove LINE friendship.

## Authentication and navigation

1. Wait for the existing AuthProvider to restore storage before deciding whether a session is usable.
2. If authentication is missing or expired, replace navigation with the localized /login?redirect=%2Fticket route.
3. Reuse POST /auth/login, including current input validation, account-status checks, and Turnstile behavior.
4. Successful login stores authentication according to remember-me and returns to /ticket through the existing localized internal-redirect helper.
5. If authentication is present, request current-user ticket and profile data. A frontend expiry check is a navigation hint; server JWT validation remains authoritative.
6. On an API 401, clear stored authentication, remove ticket data from view, and return through the same login route. A network or 5xx failure must not clear a valid session or masquerade as an empty ticket.
7. Preserve redirect when changing the login language. For this journey, a login-to-signup link should also preserve the internal return destination through the signup flow if that flow is offered; do not rewrite unrelated registration/SSO flows.
8. Exempt /ticket in both locales from the existing global reload-to-home rule. Keep login on-page when its normalized redirect destination is /ticket, so refresh does not lose the ticket journey. Preserve the existing invitation exemptions and ordinary route behavior.

JWT_EXPIRY is currently 7d. Remember-me selects localStorage; unchecked selects sessionStorage. Neither extends JWT expiry. Sessions across LINE, Chrome/Safari, different origins, or different devices must not be assumed shared. Real-client reopening tests determine supported behavior.

## Existing API contract

No new endpoint is required.

| Method and path              | Authentication                   | Use                                                             |
| ---------------------------- | -------------------------------- | --------------------------------------------------------------- |
| POST /auth/login             | Existing password/Turnstile flow | Obtain PRIS user and JWT                                        |
| GET /api/payments/my-tickets | PRIS Bearer JWT                  | Retrieve owned confirmed registrations and ticket/event details |
| GET /api/users/profile       | PRIS Bearer JWT                  | Retrieve current account name and optional institution          |

Call the two GETs independently after authentication. Retrieve private data without browser/application caching. The ticket API binds registrations.userId to request.user.id and filters status=confirmed. Select tickets whose eventCode matches NEXT_PUBLIC_EVENT_CODE (currently PRIS-2026 in the example configuration). The existing optional eventId parameter may narrow the server request when an event ID is already available; do not add a lookup request solely for that optimization. Do not accept userId from the URL.

Render regCode, ticketName, status, eventStartDate, eventEndDate, eventLocation, and the attendee identity. Optional includes, workshops, galaTicket, and adminGrantedSessions can appear after the primary pass, only when present. Preserve server-derived session access; do not calculate entitlements from a role or ticket label in the browser.

The current response does not expose check-in completion. Do not display a checked-in badge or create a new endpoint for it in this release. Receipt download, payment amount, email, phone, and government identifiers are not necessary for the primary scanning surface.

The API may return more than one confirmed registration for the same event. Keep each regCode attached to its own ticket; show an explicit labeled ticket selector/list rather than silently pairing one code with another ticket's details. Avoid a separate carousel or state-management library.

## QR contract

Use the existing qrcode.react dependency. Encode the raw registration regCode as the Pris2026 profile already does. Do not encode a login token, attendee personal information, or a new deep-link format. Maintain a white quiet zone of at least four modules and render a readable registration code underneath.

The staff backoffice continues to verify the registration status and session entitlement from current database state. A displayed or saved static QR does not independently grant access.

## Required states

| State                                     | Behavior                                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Restoring authentication/loading tickets  | A clear loading state; no fabricated QR or confirmed badge                                                                                                     |
| Confirmed PRIS ticket                     | Show the associated QR, registration code, identity, ticket type, and event details                                                                            |
| No matching confirmed ticket              | Show "ยังไม่พบบัตรที่ยืนยันสำหรับงานนี้" with access to existing registration/profile pages; this is not proof that no pending order exists                    |
| Missing/expired/rejected JWT              | Return to login and retain the internal ticket destination                                                                                                     |
| Login account pending/rejected            | Retain existing account-status handling; never show a confirmed ticket for an unsuccessful login                                                               |
| Network/server error                      | Explain that loading failed and provide retry; do not label it as an empty registration                                                                        |
| Profile request fails but ticket succeeds | Keep the server-authorized ticket available; display the current session name if available without presenting a failed profile refresh as missing registration |
| Multiple confirmed tickets                | Explicitly identify the chosen registration and keep QR/details consistent                                                                                     |

## Mobile surface boundary

Keep the existing shared Pris2026 Header and Footer, following the user's later instruction not to copy the generated header. Add /ticket to the Header's existing light-page classification so its normal text/logo remain readable on the Profile-derived light ground; do not change the header's layout or visual system. Use composition B only for vertical ticket geometry and reading order. All colors, fonts, logo, and control styles come from existing website code, not from the image. Keep QR and core identity near the first screen where viewport height permits. Essential content must remain available at 320 px and with enlarged text; do not make a fixed-height screen a functional requirement.

The main page is for displaying an entry pass. A QR enlargement action can improve scanning without any new API. Existing profile and registration links remain secondary. No LINE Login button, LINE user ID field, bot webhook, per-user rich menu, or new QR-generation endpoint is introduced.

## Verification before release

- First rich-menu visit without authentication reaches login and returns to the correct localized ticket page.
- Reopening with a valid remembered session shows the same attendee's correct PRIS ticket.
- Session expiry and API 401 return to login without a loop; logout prevents a stale ticket from remaining visible.
- Refresh of ticket and ticket-directed login stays in the journey; unrelated reload behavior and invitation exemptions are preserved.
- TH/EN switching preserves the return destination.
- Another account cannot obtain this attendee's ticket by changing URL parameters; the API continues to enforce ownership.
- Empty, multiple-ticket, API failure, and missing optional-content responses produce the specified states.
- Scan the raw regCode QR with the existing staff workflow and verify confirmed registration/session access behavior.
- On real iOS and Android LINE clients, test close/reopen, remember-me off, browser switching, keyboard/Turnstile login, small screens, and QR enlargement.

When implementation is authorized, extend the existing redirect/refresh tests and add one focused ticket-journey check using the installed test tools. This planning-only change does not modify executable code or require an application build.
