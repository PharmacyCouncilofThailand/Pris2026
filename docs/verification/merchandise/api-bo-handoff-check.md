# P01 — verified frontend prerequisites and baseline

The read-only frontend start gate passed before any Pris2026 feature source or
dependency installation. It verified all 29 API and 18 BO development checks,
52 evidence artifacts and 260 source inputs, actual artifact digests, the
approved recovered spec, Git ancestry, clean committed upstream repos and the
local API/worker handoff check. The exact inputs and Thai timestamp are in
`frontend-start.json`.

API completion is `693e39946bee9bbfe3a8b5ff4c6813b9b58a1e7c`; BO completion is
`cf6e84e547653f508f0bea21cfcbc287257a5e27`. Their application runtimes are pinned
independently in the start record. The BO lint exception is the specific human
approval committed there; it is not silently extended to Pris2026.

The private renderer archive copied into `vendor/` has SHA256
`97bfff8927f1295ccd29f9cb75ce8865453e444832c96f92477e16b7e3f27796`.
The canonical full API types are copied without formatting and with a provenance
header. Tests verify the type body digest, vendor archive digest, canonical
Store/Product compatibility, pure React exports and exact large monetary text.
No API/backend implementation module enters the customer application graph.

## Installation and baseline evidence

The first baseline test run passed all 98 existing tests. The first build failed
while loading the incumbent next-intl plugin's native SWC binding. Existing
`node_modules` pointed to a pnpm next-intl 4.14.9 installation, while this repo's
committed npm lockfile specifies 4.8.3. `npm ci` restored the committed dependency
tree; the native binding failure disappeared without changing application code
or upgrading the declared toolchain.

Locked versions remain Next 16.1.6, React/React DOM 19.2.3, next-intl 4.8.3,
Tailwind 4.2.1 and tsx 4.19.2. The only added dependencies are the exact private
renderer file and development-only Playwright 1.64.1. Package-lock adds entries
for those packages without updating incumbent package versions.

The first new gate test run failed because its verifier did not yet exist.
After implementation, all 104 tests pass, including six new prerequisite and
artifact tests. The production build, TypeScript check and lint of all new files
pass. Playwright's Chromium, Firefox and WebKit harness checks pass against the
actual incumbent `/th/about` route with Header, main and Footer visible and no
page errors. The frontend review port is 3102; the independent future customer
fixture origin is 3103, separate from BO and the root API. This is a harness
check, not evidence that a customer purchase flow has been implemented.

## Existing lint findings

With the restored locked tools, full lint returns 23 errors and six warnings in
23 unchanged legacy files. The same current rules applied read-only to the
original Git baseline produce identical findings; no new file has a finding.
The initial mismatched installation had different diagnostics and is not used
as the canonical lint baseline. Exact current findings and unchanged-file proof
are in `lint-baseline-comparison.json`.

No legacy lint rule has been disabled and no legacy source folder has been
ignored. Added ignores cover only generated local logs, browser reports and
private sessions. On 15 October 2026 the human approved the Pris2026 exception
only for those identical baseline findings. `lint-baseline-exception.json`
records that decision. `scripts/merchandise-lint-baseline.mjs` enforces unchanged
rules, unchanged legacy files and zero new findings. Full lint remains exit 1;
it is never reported as a clean full lint run.

## Boundaries

No souvenir route, Navbar behavior, cart, address, payment UI or existing
registration behavior is changed in P01. The one retained Docker database is
still `pris_merchandise_dev_test`; deletion requires an explicit user instruction.
Actual PaySolution money/protocol verification, physical devices and actual
Nipamail delivery remain deferred to User Test. G_RELEASE remains `not_ready`.
