# P12 — Responsive, accessibility, performance and legacy verification

Development checks passed against the production build from d6b6938710c033260d54edd35aa985ce78fc874e plus the two-line shipment wrapping correction in this checkpoint. This is local automated browser evidence, not a WCAG certification, physical-device result or production field-performance claim. The exact final checkpoint is the commit containing this report and is recorded by the next task.

## Scope and results

- 57/57 browser cases passed, zero skipped/retried, across Chromium, Firefox and WebKit. Eight accessibility/responsive, four performance/resource and seven incumbent regression cases per engine.
- All 153 unit tests, the explicit 20 required legacy helper tests, TypeScript and production build passed. Baseline-aware full lint retains the approved unchanged 23 errors/6 warnings in 23 files with zero new findings and no rule change.
- The unchanged conference-web checkout implementation passed its existing 37 targeted tests in five files: checkout wizard/quote, payment request, PRIS pricing and payment session. Its working tree remained unchanged. The completed API gate separately records real local legacy free/paid/PRIS checkout integration and 203 unchanged legacy implementation files. Pris owns the SSO boundary, not conference-web checkout; no live merchant was contacted.
- The UI detector ran once on the only changed UI source, history.css, with zero findings. Three representative shipped-detail captures (320/834/1440) were inspected together. Existing P03 references and P11 layouts remain the visual authority; no new design was introduced.

## Responsive and accessible behavior

Actual DOM checks cover 320, 390, 430, 768, 834, 1024, 1279, 1280, 1440 and 1920 CSS pixels, both shop locale headers, 2/3/4 catalogue columns and product/cart/address/history/shipped detail reflow. The full navigation begins at 1280 and is checked between the logo and tools. The 200% check combines doubled root text size and 640-to-320 CSS pixel reflow; it is not an OS zoom or physical phone claim.

Menu tests use keyboard opening, repeated Tab containment, Escape, focus return and subsequent scrolling. Search has an associated label and an existing focus-within outline on its wrapper. Main images have alternatives, shop action targets meet 44 CSS pixels (with one 1/64-pixel DOMRect rounding tolerance), error messages are associated with invalid fields and the first invalid field receives focus. Last Add/Footer actions remain above the measured fixed bar. Orange primary contrast is tested as large bold text; blue Add is tested at its computed normal/large threshold. Reduced-motion tests retain manual controls, keyboard banner changes and usable controls after pointer cancellation; dispatched pointer events are synthesized, not a physical touch claim.

Initial failures were retained, not hidden. The first Chromium batch had a false-positive search-outline assertion against the input rather than its outlined wrapper, plus a real long-carrier overflow (1483px document width at 320px viewport). The input assertion was corrected to the existing wrapper and the shipment section now allows long carrier strings to wrap, with min-width:0. The first cross-engine run exposed Firefox rounding 44px to 43.99993896484375; a rendering-quantum tolerance corrects that assertion without shrinking the CSS target. Final tests also wait for the incumbent reduced-motion homepage intro to finish naturally, without deleting its classes.

## Resource and performance evidence

Public browsing makes no owner cart/order/payment request; authenticated Header and shop share one cart read and one store read. Navigating to a non-shop page starts no merchandise API request. Product images are lazy, the single mounted initial banner is eager and inactive banners are not mounted/fetched; all rendered images reserve dimensions and use the fixture's approved media origin. Self-hosted incumbent fonts are requested once per URL, with no extra Google font network call. Published JavaScript is checked for backend credential identifiers and public source maps. This deterministic scan supplements upstream separation tests; it is not a claim to have proved arbitrary secret absence.

Measurements below are one bounded local production-build observation, with synthetic assets and no CPU/network throttle. Byte counts are observed decoded script resource bytes (cache entries can report zero), not compressed deployment bundle budgets. Raw per-resource paths, encoded/transfer/decoded bytes, font URLs and navigation timing are in performance/p12-*.json. before-chromium is the actual P11 build observation before the P12 CSS correction; it is not a reconstructed pre-feature baseline. No compiled pre-feature measurement exists, so no before/after feature-size saving is claimed. Incumbent source preservation is separately checked against db6726c5f352736f4b8bfd91452055bf8bca5cf9.

| Observation | Route | LCP ms | Observed non-input layout-shift sum | Largest qualifying event ms | Observed decoded script bytes | Font requests |
| --- | --- | --- | --- | --- | --- | --- |
| before-chromium | /th/about | 292 | 0.073105 | unsupported/no qualifying entry | 890419 | 2 |
| before-chromium | /th/souvenirs | 144 | 0.160428 | 16 | 908698 | 2 |
| chromium | /th/about | 312 | 0.075657 | unsupported/no qualifying entry | 890419 | 2 |
| chromium | /th/souvenirs | 168 | 0.160428 | 16 | 923445 | 2 |
| firefox | /th/about | 282 | unsupported | unsupported/no qualifying entry | 890419 | 10 |
| firefox | /th/souvenirs | 217 | unsupported | unsupported/no qualifying entry | 881773 | 0 |
| webkit | /th/about | unsupported/no entry | unsupported | unsupported/no qualifying entry | 857016 | 1 |
| webkit | /th/souvenirs | 708 | unsupported | 104 | 40653 | 0 |

LCP is absent where unsupported or no entry arrived. Layout-shift is an observed cumulative sum in this bounded run, not the field CLS session-window algorithm. The shop sum of 0.160428 was observed both before and after this CSS correction; this is not a zero-layout-shift result or a production performance-budget sign-off. Largest Event Timing duration is not field INP: a short synthetic run cannot provide a defensible field percentile. Unsupported/unobserved values remain explicit, never zero-filled. The image-dimension, font-request, resource-scope and no-runtime-error checks passed; real asset/network/device and field budgets still require User Test and owner review rather than an invented SLA.

## Preserved incumbent boundaries

Browser regression covers homepage Header/scroll/menu/locale in all engines, registration login and conference-web SSO request/destination, confirmed free and paid ticket presentation, paid-only legacy receipt links, Booth signup choices, invitation and presentation direct reload, lucky-wheel login return and the legacy registration return toast. Those transports are explicitly mocked local adapters, not real registrations, real invitations or bank payments. Existing helper/checkout/API tests complement that boundary evidence. Selected incumbent source files are byte-identical to the frontend starting revision. Shop payment does not create a registration ticket, receipt or registration-return toast.

Real merchant credentials/payment/Inquiry/Postback/timezone, actual Nipamail delivery and physical iPhone/Android/LINE/bank behavior remain deferred to User Test under the approved amendment. Release remains not_ready; live sales stay disabled. The single local database is retained until explicit deletion instructions.
