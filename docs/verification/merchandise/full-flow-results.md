# P13 — Customer to Backoffice integration

Local development acceptance passed **15/15** cases across Chromium, Firefox and WebKit, zero retries/skips. Commands and hashes are recorded in the execution ledger when P13 completes. All product images/prices/options, users, addresses, provider evidence and carriers are synthetic. The customer and Admin interfaces are production builds; merchandise routes, order snapshots, Inquiry settlement, durable jobs, production expansion and fulfillment are real backend implementations in an owned schema of the retained database.

The test-only adapter provides the incumbent Admin event directory and sessions, then passes all merchandise actions to the real contract-validated routes. Admin JWT expiry is explicitly supplied as required by the incumbent session parser. The initial test adapter mistakenly used the single-item quantity label for a Bundle; the first complete Chromium attempt then exposed missing Admin JWT expiry. Those failed/aborted runs are retained as diagnostics, not acceptance evidence. Production application behavior was not changed to satisfy them.

| Q25 case | Development evidence | Still required in User Test |
| --- | --- | --- |
| 1 Order and QR | Customer UI adds two Bundle sets plus two Mug units, enters another recipient, reviews 640-baht goods + 50 shipping = 690 total, confirms one order and reads the private provider-created PNG | Actual shop merchant QR creation/fields |
| 2 Successful payment | Synthetic Inquiry is verified by real settlement/worker code; owner UI becomes paid; the frozen paid email is rendered and sent to a record-only transport | Actual payment, supported Inquiry and Nipamail delivery |
| 3 QR expiry | Persisted explicit/fallback backend deadlines are observed and expired UI hides the QR | Actual bank/provider proof that an expired saved QR cannot pay |
| 4 Time calculation | Both explicit expiry and blank-expiry fallback, reload without a restarted lifetime | Provider timezone and actual response examples |
| 5 Reissue | Unknown verification offers checking only; verified unpaid permits a new reference/attempt for the same frozen order while open | Actual merchant reissue and provider identifiers |
| 6 Preorder close | A pre-close QR remains visible after close; verified expired/closed prevents reissue with the required exact Thai text | Actual bank payment within that QR lifetime after close |
| 7 Late/repeated notification | Explicit synthetic Postback **service ingress**, real queued verification and worker accept pre-expiry paid time after close; duplicate events do not add orders, production or emails | Actual HTTP method/content type/fields/source verification/acknowledgement/retry evidence |
| 8 Failed checking | Unknown Inquiry never implies unpaid and never enables a new QR | Actual timeout/empty/pagination behavior and provider budgets |
| 9 Shipping | Real Backoffice UI records single shipment and two-row Bulk shipment with different carrier/tracking pairs; customer UI refreshes; one durable notification per order/event | Actual Nipamail receipt and physical device display |

The Bundle/single case verifies production counts of Mug 4 (2 single + 2 Bundle) and fabric bag 2 (Bundle), with no manufactured Bundle row. Current totals remain 690 baht with exactly one 50-baht shipping fee. Paid email includes order number, purchased snapshots, recipient, totals, unboxing-video guidance and `pr@pharmacycouncil.org`; shipment email includes its actual synthetic carrier and leading-zero tracking string. Repeated worker passes/callbacks do not produce extra sends in the recording transport. This is not a claim of real email delivery.

The Bulk case starts with two separate purchases made through the customer UI, pays through verified synthetic Inquiry, then uses the actual Admin shipping editor. Each order keeps its own tracking ID; both owner details show shipped, and exactly four outbox events/messages exist (paid and shipped for each order). The paid/order snapshots and production totals originate from the new frontend purchases, not direct SQL inserts pretending to be purchases.

P09–P12 retain the additional negative and regression evidence: unknown confirmation and attempt recovery, owner/event isolation, stale reads, cart conflicts, required address errors, session loss/return, locked buyer fields, original/current amendments, wrong-clock countdown, private QR lifetime, link/reload/locale safety, responsive/accessibility checks and unchanged registration/receipt/activity boundaries.

Actual merchant credentials and provider/physical-bank/Nipamail acceptance remain **deferred_to_user_test** under the user-approved amendment. No legacy merchant credentials were substituted. Device steps and missing physical evidence are explicit in [device-results.md](./device-results.md). G_RELEASE stays `not_ready`; no deployment, live activation, real callback setup or launch date is implied.
