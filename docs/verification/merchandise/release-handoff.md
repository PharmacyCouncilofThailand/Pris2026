# Souvenir preorder — development handoff

This handoff covers the approved API → Backoffice → Pris2026 implementation. Development evidence is verified by `scripts/merchandise-frontend-gate.mjs` and the final completion record. **G_RELEASE remains not_ready.** Development completion does not enable a real merchant, publish the catalogue, deploy code, send a LINE OA message or choose launch dates.

The 15 October user-approved amendment is explicit in the gate: all 20 planned check IDs remain present, 19 development checks must pass, and `P-DEVICE` is recorded as `deferred_to_user_test` in release scope. `P-FULL-FLOW` covers the verified local synthetic integration; its actual merchant/mail conditions remain in G_RELEASE. No physical/provider acceptance is silently declared passed or removed.

## Entry points and configuration

- Store route: `/th/souvenirs` (also `/en/souvenirs` for the existing language chrome; product data remains Thai). Use the owner's confirmed website domain when preparing a direct LINE OA link. No domain or announcement is invented here.
- The main Navbar contains “ของที่ระลึก”. Browse is public; Add and checkout require the existing account. Validated return paths preserve the pending purchase after authentication. There is no guest checkout, OTP guest merge or address book.
- Merchandise backend routes use `/api/v1/merchandise`; Admin routes are under `/api/backoffice/events/:eventId/merchandise`. The separate shop callback path is `/api/v1/merchandise/paysolutions/postback` when its verified provider configuration is supplied. Do not redirect the registration merchant callback or reuse registration merchant credentials.
- All souvenir events share the **shop merchant**, separate from registration. Real credentials stay only in the backend/secret manager. Supported Direct QR Inquiry, callback method/encoding/source/ack/retry, time parsing and actual provider budgets still require verified shop-merchant evidence. Follow `conference-api/docs/verification/merchandise/provider-checklist.md`, `provider-contract.json` and the API handoff/runbook rather than substituting simulator facts.
- Local `.next` outputs used for verification are **test-origin builds**: Pris `127.0.0.1:3102`, Backoffice `127.0.0.1:3105`, isolated test API `127.0.0.1:3103`. They are not release deployment artifacts. Rebuild with reviewed deployment configuration after User Test; do not deploy these local bundles as-is.

## Administrator preparation

The retained development database is `pris_merchandise_dev_test` in `confer-postgres-dev`. The one physical database must remain until an explicit user deletion instruction. Test fixtures create and clean only their validated owned schemas; they do not publish test prices/images into the real event catalogue.

The real initial PRIS-2026 catalogue has the eleven approved Thai draft names: ผ้าห่ม, แก้ว Tumbler, แก้ว Mug, กระบอกน้ำ, กระเป๋าผ้า, ถุงผ้า, กระเป๋าดินสอ, กระเป๋าเครื่องสำอาง, ผ้าพันคอ, สมุด and หมอน. Admin must supply confirmed descriptions, prices and licensed images, real variant pairs and any Bundle components/quantities/choice rules before publishing. Bundles containing a disabled component/variant stop selling. No stock, business quantity limit, minimum purchase or manufacturing minimum was invented.

Admin can manage categories, banners, order, publish/sale flags, variants and Bundles; Preview uses the frozen shared renderer artifact. There is no per-product schedule, Wishlist or Coupon. Store opening/closing is per event, entered/displayed in Thai time. Actual opening/closing dates are still unset; choose them only after acceptance/readiness. Production/shipping information is optional and remains hidden when absent. Do not insert estimated dates or sample screenshot prices/photos as real sale data.

## Payment and order operations

One order has one manually entered Thai delivery address and exactly 50-baht shipping. All items ship together. Buyer and recipient can differ; account name/phone are defaults only. Customer fields lock after confirmation. Only authorized Admin can append an audited correction with a reason; paid-order financial changes are permitted only when the grand total stays the same. Differences are considered outside this system.

QR time comes from persisted backend provider expiry or the confirmed creation-time fallback; refresh, locale switch, login and returning from a bank app cannot restart it. Unknown/empty/failed Inquiry is not unpaid. Reissue first verifies the previous attempt, requires the store to remain open and creates a new reference/attempt for the same frozen order. Existing pre-close QR remains valid until its own expiry after closing. Verified unpaid/expired after closing uses the exact approved Thai closure message and offers no new QR. Delayed callback uses verified actual payment time. Duplicate callbacks/events do not add orders, production or messages; actual duplicate money is retained for manual review with no automatic refund.

Before the owned test schema was cleaned, the full load's final health snapshot retained 231 accepted-create uncertainties and 217 unknown mail sends (216 injected unknown acknowledgements plus one injected post-send finalization failure). Its ready queue, queue lag, claimed jobs and queued emails were zero. Those synthetic unknowns demonstrate conservative recovery; do not copy their protocol/budget values into live merchant configuration. In actual operation, review unknown creation/payment/mail outcomes using references, durable job state and merchant/Nipamail evidence; do not blindly recreate QR or resend mail.

Manual single and Bulk shipping require each order's own carrier and Tracking ID before marking shipped. Owner history separates payment from shipping and preserves leading zeroes. Paid and shipped email events use the buyer account email, are idempotent, and contain the approved unboxing-video/support wording. No carrier API, automatic refund/return/exchange flow or souvenir invoice/receipt was added.

## What remains before accepting real payments

These are the existing approved release conditions, not additional product policy:

1. In an authorized User Test environment, configure the actual separate shop merchant and verify Direct QR creation, the supported Inquiry and identifier matching, actual timestamps/timezone, actual callback protocol/source/ack/retries, duplicate/late handling and provider limits. Keep `referenceNo`, `orderNo` and `transactionId` separate. `success` from QR creation is not paid; test status `TC` is not real money.
2. Complete Q25's actual merchant/bank/saved-image-expiry cases and real Nipamail delivery. Keep credentials, usable QR images and sensitive evidence private while recording sanitized references/amount/time relationships.
3. Complete physical iPhone/Android and LINE/bank handoff/reload/resume/orientation tests in [device-results.md](./device-results.md). Browser engine/viewports are explicitly not physical-device acceptance.
4. Admin prepares actual catalogue/options/Bundles/prices, banner content and image-use rights, reviews Preview and real-asset mobile layouts, then sets the Thai preorder window only after acceptance.
5. Review actual environment capacity, observed performance and provider/worker budgets. Local load passed correctness at 1,000 sessions plus registration readers and browser clients; no production latency SLA was approved. P12 records observed layout shift rather than claiming zero CLS or field INP.
6. Review the source versions and `G_API`, `G_BO`, development `G_PRIS`, then complete the separate `G_RELEASE` review. Deployment/publication/live activation still need the owner's authorized release decision.

Business decisions deliberately left as requested: receipt/tax document issuer/format/tax treatment; privacy notice/retention/approver; manufacturing minimum; production/shipping dates; and cancellation/refund/exchange policy. No substitute policy or automatic rule was invented. These are recorded as deferred business decisions, not silently turned into new mandatory UI checkboxes or launch conditions.

## Verification and preserved boundaries

The source order, per-task tests/commits and dependency rechecks are in [execution-state.json](./execution-state.json). Original approved home and all 25 subsequent references remain unchanged. The final regenerated synthetic captures/measurements are frozen in `final/visual` and `final/performance`; `final/evidence-map.json` links them to their producing test outputs. Only those known generated historical output files are restored from the committed P13 baseline after their final copies are saved. Earlier task captures/logs keep their original meaning, while the final manifest hashes the new copies and current source.

The final suite covers all 18 merchandise browser files across Chromium, Firefox and WebKit with retries disabled, plus 153 application/helper unit tests and dedicated gate negative tests. Raw final command/browser proof is stored in `final/` after successful completion; it excludes usable merchant QR or real recipient data. The approved lint exception remains **23 unchanged errors/6 warnings in 23 baseline files, zero new findings**; full raw lint is not called green and no rule is weakened.

The customer/Admin integration and 1,000-session records are [full-flow-results.md](./full-flow-results.md) and [full-load-report.md](./full-load-report.md). Registration SSO/checkout/ticket/receipt, Booth, invitation, presentation and lucky-wheel boundaries retain their earlier source and regression proofs. No registration merchant/settings or entitlement grant is repurposed by merchandise payment.

To verify the recorded completion on the assembled workspace with its matching upstream evidence:

```powershell
node scripts/merchandise-frontend-gate.mjs --record docs/verification/merchandise/frontend-completion.json
node docs/design/merchandise/subsequent-screens/verify-references.mjs --require-approval
```

The first command is read-only: it validates the supplied record, actual proof files/checksums, final browser outcomes, source manifests and upstream gates. It cannot enable sales or promote deferred User Test evidence to a release pass. Missing/stale files or source drift fail the gate; rerun affected verification and regenerate reviewed evidence for a changed version.

Reproduction uses `npm test`, `npx tsc --noEmit`, `node --test scripts/merchandise-frontend-gate.test.mjs`, `node scripts/merchandise-lint-baseline.mjs`, `npm run build`, and the complete `playwright.merchandise.final.config.ts` suite with the owned local production servers/fixture origins above. Stop the owned frontend server before rebuilding. The long load requires an explicit `node scripts/merchandise-integrated-load.mjs --smoke` followed by `--full`; it never defaults to a long run and never sends 1,000 real payments.
