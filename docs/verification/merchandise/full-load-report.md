# P13 — Integrated local load result

Status: **passed for development capacity/correctness**, completed 2026-10-15T17:41:29.285Z. Actual provider, physical-device/bank and Nipamail delivery remain **deferred_to_user_test**. No latency SLA or production environment equivalence is claimed.

The canonical A21 harness is reused through a checksum-pinned generated test adapter, preserving its workload, worker fault injection, legacy readers, Admin bulk/export checks and financial/production/outbox assertions. The adapter changes only the isolated event code to PRIS-2026, loopback/CORS/media wiring, output destination and an IPC lifecycle for browser clients. It does not edit the API repository or overwrite the original API-only A21 proof. The generated module is explicitly ESM (.mts); an initial .ts attempt failed before execution and is retained privately. The adapter's smoke run passed with 20 store identities and three complete browser UI journeys before the full run.

The full workload has 1,000 authenticated store sessions (600 browse/search, 200 cart/quote, 100 status and 100 purchase), plus 50 registration readers. Ramp 300 seconds, steady 1,200 seconds, gradual cooldown 300 seconds; 15-second think time. Three additional owners run actual customer DOM journeys in production Next.js concurrently. They browse/search, open a product, Add, open the real cart, enter an address, obtain/review a canonical quote and read owner history. The load browser clients deliberately do not confirm purchases: API sessions exercise confirmation/payment/settlement while the separate 15-case UI acceptance suite covers that complete flow through real Admin UI and record-only mail.

| Measurement | Observed |
| --- | ---: |
| Peak active store sessions | 1000 |
| Canonical unique store + registration identities | 1050 |
| Additional browser owners | 3 |
| Valid interior steady samples, each observing all 1,000 store accounts | 38 |
| Canonical HTTP requests | 254109 |
| Peak HTTP requests in flight, including browser API/media | 283 |
| Expected business/version conflicts | 20 |
| System / worker / failed journey errors | 0 / 0 / 0 |
| Canonical HTTP p50 / p95 / p99 ms | 73.66 / 813.67 / 1396.81 |
| Canonical requests per second | 133.21 |
| Elapsed including browser/drain/invariant work, seconds | 1907.65 |
| Observed / configured API pool | 20 / 20 |
| Maximum sampled Lock waiters / wait age ms | 18 / 662.27 |
| Event-loop mean / max delay ms | 21.03 / 403.44 |
| Synthetic provider create / Inquiry calls | 8568 / 6183 |
| Verified paid orders | 4988 |
| Record-only email sends | 4988 |
| Parsed XLSX downloads / cumulative verified order rows | 30 / 110685 |
| Admin bulk operations | 30 |
| Completed browser UI journeys | 277 |

| Browser engine and recorded version | CSS width | Completed UI journeys | Observed journey p95 ms | Journeys starting in the measured 1,000-account steady window |
| --- | ---: | ---: | ---: | ---: |
| chromium 156.0.8078.4 | 390 | 98 | 7780.52 | 63 |
| firefox 157.0 | 834 | 92 | 8638.64 | 60 |
| webkit 27.2 | 1440 | 87 | 8095.47 | 56 |

Browser journey duration is the whole multi-page user workflow, including UI actions and backend waits; it is not a page response SLA. Canonical request percentiles/counts exclude the separate browser requests, while the API in-flight and pool/event-loop observations see their shared process work. Browser/static page execution is real Next.js production output, not an HTTP-only configuration claim; three representative engine processes are not 1,000 browser processes or physical phones. Generator and API share one local Node process, and other local processes may share machine resources. Lock ages are sampled observations rather than per-query percentiles.

All canonical business assertions passed: buyer/event cart uniqueness; one active attempt per order; unique references and email events; stable confirmation replay; exact 50-baht shipping and financial arithmetic; verified matching settlement; no unexpected review; unchanged legacy financial/entitlement rows; and exact paid effective-snapshot production including selectable/fixed Bundle expansion. Each export is parsed and checked for the snapshot of pre-request orders, linked items/components, exact money/quantity arithmetic, unique rows and string cells. Three browser clients also assert their own recipient, empty owner history, page width and zero page-runtime errors, preventing a superficially healthy but wrong-owner UI result.

Fault injection retained accepted-create uncertainty, Inquiry timeout/incomplete results, one durable worker restart after a mail finalization failure, and 216 unknown email acknowledgements. There were 1 injected commit failures and 1 observed worker restarts; unknown mail acknowledgements were not blindly resent. No actual merchant/Nipamail load was sent. Synthetic provider budgets are recorded in full-load-results.json and are not real provider allowances.

Raw measurements, time series, source fingerprints, worker health, provider budgets and every browser observation are in [full-load-results.json](./full-load-results.json). The retained single physical development database is unchanged; only the run's owned temporary schema is cleaned by the established harness. No store is enabled for real sales and G_RELEASE remains **not_ready**.
