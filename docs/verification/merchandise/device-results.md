# P13 — Device evidence and deferred User Test

Physical device acceptance: **deferred_to_user_test**, not passed and not represented by skipped automated tests. The approved execution amendment moves actual merchant/bank/physical-bank evidence to User Test after development. No device model, OS/browser version, LINE result or bank result has been invented.

The local production-build acceptance suite runs the real customer UI and real Backoffice UI against one isolated backend schema, using Chromium, Firefox and WebKit. The load run additionally uses these engines at 390, 834 and 1440 CSS pixels. These are automated browser engines and emulated viewports, not physical iPhone, iPad, Android or Safari certification. P12 records responsive and text-reflow checks separately.

| Required surface | Actual physical result | Remaining evidence |
| --- | --- | --- |
| iPhone Safari | deferred_to_user_test | Model, iOS/Safari versions, full steps and sanitized captures |
| iPhone LINE in-app browser | deferred_to_user_test | LINE version, direct link, auth return, QR image save/import and return to the same order |
| Android Chrome | deferred_to_user_test | Model, Android/Chrome versions, full steps and sanitized captures |
| Android LINE in-app browser | deferred_to_user_test | LINE version, direct link, auth return, QR image save/import and return to the same order |
| Actual desktop Chrome/Edge and available Safari/Firefox | deferred_to_user_test | OS/browser versions and operator results; automated engines do not replace this record |
| Bank app and saved QR expiry | deferred_to_user_test | Bank/app versions, actual shop merchant references and provider/operator evidence |

For each physical run, record the account fixture identifier (no password/token), UTC time plus Thai display, exact frontend/API/Backoffice commits, route, device/OS/browser/LINE/bank versions, expected result, actual result and sanitized evidence path. Keep credentials and still-usable payment QR images private. Record the existing order ID, provider reference/order/transaction identifiers separately and preserve their association without publishing secrets.

Required sequence:

1. Open the direct `/th/souvenirs` link from the intended LINE OA link; browse publicly, select a real confirmed option/Bundle, require the existing account before Add, then return to that selection after login/signup/SSO. Do not send a LINE OA announcement as part of this test.
2. Complete cart, recipient/address, the one 50-baht shipping fee, review and confirmation. Confirm that buyer fields lock and refresh/locale changes return to the same order and attempt.
3. Save the provider-issued QR, import/scan with the actual bank app, background/resume and return to the same order. Check the verified payment result without a registration-success toast or ticket/receipt grant.
4. Reopen and log in again near expiry; check the persisted server deadline, orientation/text scaling and a deliberately wrong device wall clock. Do not infer actual provider timezone from the simulator.
5. Verify actual 10-minute expiry including the saved image. Check the old payment before requesting a new QR; the same order must receive a new reference and image only while preorder is open.
6. Check pre-close QR payment within its lifetime after closing, verified expired/closed copy, delayed/duplicate callback, failed Inquiry and the inability to infer unpaid from an empty/failed query. Record actual paid time separately from callback arrival time.
7. Confirm real Nipamail delivery to the buyer account for paid and shipped events, and check separate per-order tracking for single and Bulk shipping. Verify unboxing/support wording and lack of duplicate messages.

G_RELEASE remains **not_ready** until actual device/provider/mail evidence and the other catalogue/configuration release conditions are reviewed. Development test success does not enable sales, configure a real merchant callback or set a launch date. The single local development database remains retained until explicit deletion instructions.
