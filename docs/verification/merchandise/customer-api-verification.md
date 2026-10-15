# P02 — customer transport and scoped state

The customer client implements canonical R01–R14 and R41 paths independently of
the registration payment client. Public store/catalog/product reads send no
owner token. Owner calls require the current session token and use no-store,
explicit Authorization, omitted ambient cookies and caller AbortSignals. Only
R05, R09 and R12 take their caller's stable intent key; the client never invents
a replacement key or retries a mutation automatically. R41 can inspect an
ambiguous confirmation before later checkout UI decides what to show.

Canonical response guards cover required DTO keys, unknown-field rejection,
UUIDs, valid explicit UTC instants, safe integer quantities/revisions, literal
THB/5000 shipping and exact minor-unit strings up to 30 digits. They reject
draft/private extras in public product data, unexpected resource IDs, inconsistent
cart counts, inconsistent totals and contradictory order payment states. Header
shipping and subtotal validation uses BigInt as an integrity check; it does not
set the backend's price or availability. Product variants remain attached to
their actual parent IDs. The API's store response resolves the configured event
code to its real event ID; no event number is hardcoded by the application.

HTML/non-JSON success or error responses become curated Thai failures. Safe
status/code and conflict version metadata survive, while raw provider messages
and markup do not. An ambiguous mutation is marked uncertain, never mapped to
paid, failed or verified-unpaid. QR retrieval is a private binary PNG endpoint;
JSON/HTML and invalid PNG signatures are rejected. There is no frontend merchant
configuration, provider key, base64 payment generator or client-paid override.

MerchandiseProvider reuses the incumbent AuthContext after hydration. Public
store state is separate from lazy owner cart/order reads. Anonymous and expired
sessions make no owner request. Cart/order scopes include event, account/token
and order identity. A scope change immediately hides old results and aborts the
old request; a fetch implementation that ignores AbortSignal still cannot put a
late response into the new scope. Refresh hides previous private data until the
new read succeeds, and a denied read cannot retain a recipient on screen. Order
responses must match the resolved event and the known current buyer ID.

The souvenir route subtree now has only the Provider and neutral loading/error
boundaries using the incumbent typography and approved blue action. No store
page, purchase-screen composition, Navbar behavior or registration flow is
implemented/changed in this task. P03 still reviews subsequent purchase-screen
visual references before those screens are built.

## Executed checks

- Initial new API/formatter tests failed on the missing implementation.
- All 116 project tests pass, zero skipped or failed. The 18 merchandise tests
  include transport, negative prerequisite/artifact checks, exact formatting and
  React state tests. Twelve are the new P02 API/format/state cases.
- State tests cover anonymous/stale tokens, account switching with deliberately
  late old responses, token rotation, logout while a read is pending, event
  mismatch, and a 401 reload after displaying a synthetic recipient.
- All owner methods are checked for exact canonical verbs/paths, body revisions,
  Authorization, caller keys and AbortSignals. Negative cases include malformed
  money/time/quantity/state, public draft or private extras, wrong IDs, 401/409/
  422/503, HTML, network ambiguity and non-PNG QR responses.
- TypeScript and production build pass. The current unchanged ESLint rules report
  no new findings; only the approved 23 errors/six warnings in 23 identical
  legacy files remain. The design detector returns an empty findings array.

Raw development command logs remain in ignored `.merchandise-local/`; their
digests and results are recorded in the execution ledger. Transport responses in
these tests are explicit synthetic fixtures; real API integration is exercised
in later store/purchase tasks. These checks do not claim bank/provider payment,
physical device use, actual email delivery or launch readiness. The retained
Docker database and User Test deferral are unchanged.
