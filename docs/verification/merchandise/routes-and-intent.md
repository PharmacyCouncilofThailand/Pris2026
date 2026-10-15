# P04 — Routes and authenticated purchase intent

Implemented within the approved scope: public navigation entry, strict shop-only return URLs, refresh/locale preservation, existing signup/login propagation, scoped SSO return support, non-PII purchase-intent storage, owner guards and durable idempotent resumption. Existing registration/ticket/presentation/Lucky Wheel redirect behavior remains covered by incumbent tests.

The existing native Next SSO callback also required a shop-only branch: its router consumes locale-prefixed URLs, unlike the next-intl login router. This is a necessary caller of P04 return validation, not a replacement authentication system. Header observes ownership without changing AuthContext or making global private API requests.

Before authentication no cart mutation is sent. Intent stores IDs, quantity, a validated return path, and—after claiming—buyer ID/original cart revision. It stores no recipient, email, token, price or QR. Rejected/disabled browser storage cannot authorize a write. A request with an unknown reply retains the same intent key and exact POST body, even if the cart/catalog/window changes. The backend remains authoritative for availability and idempotency.

New tests cover unsafe/encoded/traversal destinations, duplicate filters, control characters, catalog query preservation, SSO locale handling, active account/event checks, pending-read account/selection changes, default/fixed options, missing selectable options, unknown retry payload equality and concurrent resumption. Browser tests exercise actual menu, language, signup links/reload and the incumbent SSO router in Chromium/Firefox/WebKit; only the SSO authentication response is explicitly mocked.

## Dependency to return to immediately after P05

`P04-P05-LOGIN-ADD`: the actual storefront is created in P05. Revisit `route-login.spec.ts` to prove direct shop/reload/locale → anonymous Add → existing login → same purchase intent → real local merchandise API cart result without duplicate increment, including owner/session isolation. There is no shop index page in P04; the SSO route test proves URL handoff only and does not claim a functional shop from a 404.

This dependency is permitted by the user's explicit instruction to note later-task dependencies, proceed, then return to the pending tests. P04 is not marked fully passed until that case succeeds. Private product/cart/address/order screens and their guard wiring are verified with their own implementation tasks P06–P11. Real sign-in credentials, provider money, bank/LINE/physical-device testing remain deferred to User Test.

P04 uses the approved baseline-only lint exception: unchanged legacy findings only; no rules disabled and new/modified source must pass. Evidence commands/digests are recorded in `execution-state.json`.
