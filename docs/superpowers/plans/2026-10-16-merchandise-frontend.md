# Merchandise Frontend (new API contract) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ปรับ UI ร้านของที่ระลึกบน `feat/merchandise-preorder` ให้ใช้ merchandise API ใหม่ (สตางค์ integer, checkout ด้วย Idempotency-Key, QR วาดจาก `qrPayload`) โดยคงหน้าจอเดิมไว้

**Architecture:** เปลี่ยนชั้นข้อมูลจากล่างขึ้นบน คือ types → validators → API client → pure helpers แล้วตามด้วยหน้าจอทีละกลุ่ม ซึ่งแต่ละกลุ่มมี Playwright spec ของตัวเองที่วิ่งกับ fake API แบบมี state (`context.route`) ตัว storefront renderer ย้าย source มาจาก Backoffice backup branch แทน tgz

**Tech Stack:** Next.js (App Router, `next-intl`), React 19, TypeScript, `qrcode.react`, `node:test` ผ่าน `tsx --test`, Playwright 1.64

**Spec:** `docs/superpowers/specs/2026-10-16-merchandise-frontend-design.md` (อ่านคู่กับ plan นี้ทุก task) และ contract `../conference-api/docs/superpowers/specs/2026-10-16-merchandise-api-design.md` §7.5, §8, §8.5 และ DTO ต้นฉบับ `git -C ../conference-api show feat/merchandise-preorder:src/modules/merchandise/types.ts` (commit `25cd3fb`)

## Global Constraints

- ทำบน `feat/merchandise-preorder` เท่านั้น ห้ามแก้ `main` ห้าม push ห้าม stash/reset/switch branch ของ repo อื่น
- เงินเป็น `number` สตางค์ safe integer ≥ 0 ค่าส่ง `5000` และ `currency: "THB"` และไม่คำนวณยอดรวมฝั่ง client
- ทุก path API อยู่ใต้ `${NEXT_PUBLIC_API_URL}/api/v1/merchandise` และ `eventCode = process.env.NEXT_PUBLIC_EVENT_CODE ?? "PRIS-2026"`
- `Idempotency-Key` ตรง `^[A-Za-z0-9_-]{1,100}$` (ใช้ `crypto.randomUUID()`)
- ข้อความไทยที่กำหนดตายตัว (ห้ามเปลี่ยนตัวอักษร): “QR หมดอายุ”, “ขอ QR ใหม่”, “หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว”, “กำลังตรวจสอบการชำระ กรุณารอสักครู่”, “ตรวจสอบไม่สำเร็จ กรุณาลองอีกครั้ง”, “ของที่ระลึก” และข้อความอื่นในตาราง spec §7.2 และ §9
- `qrPayload` ห้ามเขียนลง storage, URL หรือ log
- ระหว่างทาง `npx tsc --noEmit` อาจแดงได้เพราะหน้าจอที่ยังไม่ถูกปรับ แต่ unit test ของ task นั้นต้องเขียว และ Task 12 ต้องเขียวทั้ง tsc, lint (ไม่เพิ่ม error), build, unit และ e2e
- Unit test ใช้ `import test from "node:test"; import assert from "node:assert/strict";` วางไฟล์คู่กับโมดูลใน `src/lib/` และรันด้วย `npx tsx --test <file>`
- Commit message ลงท้ายด้วย `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Review Focus

1. **กลับจากแอปธนาคารหลังแท็บถูกพักนาน:** `performance.now()` บน iOS อาจหยุดเดินระหว่างที่หน้าถูกพัก นับถอยหลังจึงต้อง re-anchor จาก `serverNow` ของ view ใหม่ที่ได้หลัง `visibilitychange` และห้ามแสดงเวลาเหลือเกินจริง → test ใน Task 9
2. **กด “ยืนยันคำสั่งซื้อ” สองครั้งติดกัน:** ต้องมี POST ออกไปครั้งเดียว และครั้งที่สองไม่สร้าง key ใหม่ → test ใน Task 8
3. **Token หมดอายุ (401) ตอน POST orders:** ต้องไม่ลบ key และร่างผู้รับ เมื่อล็อกอินแล้วกลับมาที่ checkout ต้องกดลองอีกครั้งด้วย key เดิมได้ → test ใน Task 8
4. **กด Back กลับมาที่ checkout หลังสร้างออเดอร์แล้ว:** ตะกร้าว่าง ต้องพาไปตะกร้าว่าง/ร้าน ไม่แสดง error ดิบ → test ใน Task 8
5. **รายการในตะกร้าที่ `product: null` หรือ variant ถูกลบ:** ต้อง render “สินค้านี้ไม่มีแล้ว” พร้อมปุ่มลบ หน้าต้องไม่พัง → test ใน Task 7

---

### Task 1: Rebase และลบของเก่า

**Files:**
- Delete: `docs/verification/merchandise/` (ทั้งโฟลเดอร์), `scripts/merchandise-browser-fixture.mjs`, `scripts/merchandise-frontend-gate.mjs`, `scripts/merchandise-frontend-gate.test.mjs`, `scripts/merchandise-integrated-load.mjs`, `scripts/merchandise-lint-baseline.mjs`, `scripts/merchandise-load-browsers.mjs`, `scripts/merchandise-start-gate.mjs`, `playwright.merchandise.final.config.ts`, `src/lib/merchandiseStartGate.test.ts`, `src/lib/merchandiseContract.test.ts`, `tests/merchandise/acceptance.spec.ts`, `tests/merchandise/performance.spec.ts`, `tests/merchandise/harness.spec.ts`, `tests/merchandise/live-fixture.ts`, `tests/merchandise/storefront-visual.spec.ts`, `tests/merchandise/product-visual.spec.ts`
- Modify: `package.json` (ลบ script `check:merchandise-start`), `.gitignore` และ `eslint.config.mjs` (ลบ `.merchandise-local` ถ้าไม่มีไฟล์ใดอ้างถึง)

- [ ] **Step 1:** `git fetch origin && git rebase origin/main` ถ้ามี conflict ให้หยุดแล้วรายงาน (คาดว่าไม่มี เพราะ `merge-tree` สะอาด)
- [ ] **Step 2:** รัน `npm test` และ `npm run build` แล้วบันทึกผลไว้เป็น baseline ใน scratch ของ session (ถ้าแดงอยู่แล้วตั้งแต่ก่อนแก้ ให้บันทึกว่าแดงตรงไหน ไม่ต้องแก้)
- [ ] **Step 3:** ลบไฟล์ตามรายการ แล้ว `git grep -n "merchandise-start-gate\|merchandise-frontend-gate\|merchandise-browser-fixture\|live-fixture\|\.merchandise-local"` ต้องไม่เหลือผลลัพธ์นอก `docs/design`
- [ ] **Step 4:** Commit `chore: drop merchandise artifacts of the retired contract`

### Task 2: Types, การจัดรูปเงิน และ validators

**Files:**
- Rewrite: `src/types/merchandise.ts`, `src/lib/merchandiseResponse.ts`
- Modify: `src/lib/merchandiseFormat.ts`, `src/lib/merchandiseFormat.test.ts`
- Create: `src/lib/merchandiseResponse.test.ts`

**Interfaces:**
- Produces (`src/types/merchandise.ts`): DTO ผู้ซื้อทุกตัวตาม spec §5.1 โดยชื่อและรูปร่างตรงกับ API `types.ts` ทุกตัวอักษร บวก `ApiFailure { success:false; code:string; error:string; requestId:string; details?: Record<string, unknown> }`, `Page<T> { items:T[]; pagination:{page:number; limit:number; total:number; totalPages:number} }`, `CreateOrderResult { order: OrderDetail; replayed: boolean }`, `PaymentResult { payment: PaymentView }`, `CartItemInput { productId:string; variantId:string|null; bundleSelections:BundleSelection[]; quantity:number }`, `CartItemPatch { quantity?:number; variantId?:string|null; bundleSelections?:BundleSelection[] }` หัวไฟล์มี comment บอกต้นฉบับ `conference-api@25cd3fb src/modules/merchandise/types.ts`
- Produces (`merchandiseFormat.ts`): `isMinor(v: unknown): v is number`, `formatMinorBaht(minor: number): string`, `isIsoUtc` และ `formatMerchandiseTime` (คงเดิม)
- Produces (`merchandiseResponse.ts`): `type Check = (v: unknown) => boolean` และ check ต่อ DTO ได้แก่ `storeResponse`, `productResponse`, `pageResponse(item: Check)`, `cartResponse`, `orderSummaryResponse`, `orderResponse`, `createOrderResponse`, `paymentResponse` รวมถึง `record` และ `uuid` (คง export เดิม)

- [ ] **Step 1: เขียน test ที่ fail**

`merchandiseFormat.test.ts`: `formatMinorBaht(125000) === "฿1,250.00"`, `formatMinorBaht(5) === "฿0.05"`, `formatMinorBaht(0) === "฿0.00"`, `isMinor(1.5) === false`, `isMinor(-1) === false`, `isMinor("5000") === false` และ `formatMinorBaht(-1)` throw

`merchandiseResponse.test.ts` ใช้ fixture DTO ที่ถูกต้องในไฟล์ test ดังนี้
- `storeResponse(validStore) === true`
- `storeResponse({...validStore, shippingMinor: "5000"}) === false`
- `productResponse({...p, price:{kind:"exact", amountMinor:"100"}}) === false`
- `cartResponse({...cart, amounts:null}) === true`
- `orderResponse(o)` ที่มี `payment.state:"qr_active"` และ `attempt.qrPayload:null` → `false`
- `payment.state:"refunded"` → `false`
- object ที่มีฟิลด์เกินมา เช่น `{...validStore, extra:1}` → `true` (ยอมรับฟิลด์ใหม่จาก API)
- `pageResponse(productResponse)({items:[p], pagination:{page:1,limit:100,total:1,totalPages:1}}) === true`

- [ ] **Step 2:** `npx tsx --test src/lib/merchandiseFormat.test.ts src/lib/merchandiseResponse.test.ts` → FAIL
- [ ] **Step 3:** เขียน types และปรับ `formatMinorBaht` ให้รับ number (`Intl.NumberFormat("en-US",{minimumFractionDigits:2})` ของ `minor/100` ก็พอ เพราะเพดานยอดของ API คือ 2,000,000 บาท) จากนั้นเขียน validators ใหม่ด้วย helper เดิม ลบ check ของ quote/revision/order-request/attempt PNG ทิ้ง
- [ ] **Step 4:** รัน test ข้างบน → PASS
- [ ] **Step 5:** Commit `feat(merchandise): adopt the new buyer DTOs and integer satang`

### Task 3: API client และ error mapping

**Files:**
- Rewrite: `src/lib/merchandiseApi.ts`, `src/lib/merchandiseApi.test.ts`
- Create: `src/lib/merchandiseErrors.ts`, `src/lib/merchandiseErrors.test.ts`

**Interfaces:**
- Consumes: types และ checks จาก Task 2
- Produces: `class MerchandiseApiError extends Error { status:number; body:ApiFailure; uncertain:boolean }`, `merchandiseFailure(status?, code?, uncertain?)`, `createMerchandiseApi({baseUrl?, fetcher?})` ที่คืน object ซึ่งมีเมธอดตามตาราง spec §5.2 ทุกเมธอดรับ `signal?: AbortSignal` เป็นพารามิเตอร์สุดท้าย ได้แก่ `store`, `products`, `product`, `cart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `createOrder(eventCode, token, key, body)`, `orders`, `order`, `checkPayment`, `requestQr` รวมถึง `type MerchandiseApi` และ `merchandiseApi`
- Produces (`merchandiseErrors.ts`): `type MerchandiseErrorAction = "login" | "reload_cart_review" | "go_cart" | "store_closed" | "new_key" | "verifying" | "check_failed" | "payment_unavailable" | "rate_limited" | "field_errors" | "not_found" | "buyer_forbidden" | "show_message"` และ `errorAction(e: MerchandiseApiError): MerchandiseErrorAction` ตามตาราง spec §9

- [ ] **Step 1: เขียน test ที่ fail** (ใช้ `fetcher` ปลอมที่บันทึก request)
  - `createOrder("PRIS-2026","t","k-1",body)` ส่ง `POST .../events/PRIS-2026/orders` พร้อม header `Idempotency-Key: k-1` และ `Authorization: Bearer t` แล้วคืน `{order, replayed:false}`
  - `createOrder` ด้วย key `"a b"` throw โดยไม่เรียก fetcher
  - fetcher reject (network) → `MerchandiseApiError` ที่ `uncertain === true` และ status 503 → `uncertain === true` แต่ status 409 → `uncertain === false` และ `body.code === "MERCH_CART_CHANGED"` (ข้อความ `error` ส่งต่อจาก server)
  - response 200 ที่ไม่ผ่าน validator → `body.code === "MERCH_BAD_RESPONSE"`
  - `products("PRIS-2026",{limit:100})` → URL ลงท้าย `/products?limit=100` และไม่มี `search`
  - `requestQr` → `POST /orders/<id>/payment-attempts` และ `checkPayment` → `POST /orders/<id>/payment-checks`
  - `errorAction` ครบทุกแถวของ spec §9 เช่น 409 `MERCH_PAYMENT_VERIFYING` → `"verifying"`, 401 ใดๆ → `"login"`, 400 `VALIDATION_ERROR` → `"field_errors"`, 418 `X` → `"show_message"`
- [ ] **Step 2:** `npx tsx --test src/lib/merchandiseApi.test.ts src/lib/merchandiseErrors.test.ts` → FAIL
- [ ] **Step 3:** Implement ตาม interface โดยคง `merchandiseEventBase`, การตรวจ UUID และข้อความ fallback ตาม status ไว้ ลบ `quote`, `orderRequest*`, `qr` และ `attempt(…key)` แบบเดิมออก
- [ ] **Step 4:** รัน test → PASS
- [ ] **Step 5:** Commit `feat(merchandise): rebuild the API client for the new contract`

### Task 4: Catalog, ตัวเลือก และผู้รับ

**Files:**
- Create: `src/lib/merchandiseCatalog.ts`, `src/lib/merchandiseCatalog.test.ts`
- Rewrite: `src/lib/merchandiseSelection.ts(+test)`, `src/lib/merchandiseRecipient.ts(+test)`
- Delete: `src/lib/merchandiseCart.ts(+test)` ถ้ามีแต่ logic revision (ย้ายส่วนที่ยังใช้ไป Selection)

**Interfaces:**
- Produces: `filterCatalog(products: ProductDto[], f: {q?: string; categoryId?: string; kind?: "single"|"bundle"; page?: number}, pageSize = 12): {items: ProductDto[]; page: number; totalPages: number; total: number}`
- Produces: `type Selection = {variantId: string|null; bundleSelections: BundleSelection[]}`, `defaultSelection(p: ProductDto): Selection`, `selectionComplete(p: ProductDto, s: Selection): boolean`, `selectionPriceMinor(p: ProductDto, s: Selection): Minor|null`, `describeLine(line: CartLine): string` (เช่น `"ไซซ์ M / สีขาว"` หรือส่วนประกอบของ Bundle)
- Produces: `type RecipientDraft = Record<keyof Recipient, string>`, `emptyRecipient(defaults: CartDto["buyerDefaults"]): RecipientDraft`, `validateRecipient(d: RecipientDraft): {ok: true; value: Recipient} | {ok: false; errors: Partial<Record<keyof Recipient, string>>}`, `normalizePhone(raw: string): string|null`

- [ ] **Step 1: เขียน test ที่ fail**
  - catalog: ค้นหา `"mug"` เจอ “แก้ว Mug”, `kind:"bundle"` เหลือแต่ bundle, หน้า 2 ของ 13 รายการมี 1 รายการ, `page` เกินจำนวนหน้า clamp เป็นหน้าสุดท้าย
  - selection: สินค้า `hasOptions:false` → `defaultSelection` ได้ variant แรกที่ `saleEnabled` และ `selectionComplete === true`, สินค้ามีตัวเลือกเริ่มที่ `variantId:null` (ไม่ complete), bundle ที่มี component fixed 1 + selectable 1 → complete เมื่อมี selection 1 รายการที่ `variantId` อยู่ใน `allowedVariants` และ selection ของ component fixed ถูกตัดออก, `selectionPriceMinor` ใช้ `variant.priceMinor ?? price.amountMinor`
  - recipient: `normalizePhone("+66 81-234-5678") === "0812345678"`, `"12345"` → null, `postalCode:"1010"` → error, `company:"  "` → `null`, `fullName` ยาว 201 ตัว → error
- [ ] **Step 2:** รัน 3 ไฟล์ test → FAIL
- [ ] **Step 3:** Implement (กติกาตาม `recipientSchema` ที่ spec §6.4 คัดลอกมา และข้อความ error ใช้ภาษาไทยชุดเดิมของ `RecipientForm`)
- [ ] **Step 4:** รัน test → PASS
- [ ] **Step 5:** Commit `feat(merchandise): client catalog filtering, selections and recipient rules`

### Task 5: Intent, Idempotency-Key และโมเดลการชำระเงิน

**Files:**
- Rewrite: `src/lib/merchandiseIntent.ts(+test)`, `src/lib/merchandisePayment.ts(+test)`
- Create: `src/lib/merchandiseCheckoutKey.ts(+test)`
- Delete: `src/lib/merchandiseOrderRequest.ts(+test)`, `src/lib/merchandiseState.test.ts` (ย้าย case ที่ยังใช้ได้มาไว้ใน payment test)

**Interfaces:**
- Produces (intent): `PurchaseIntent {id; eventCode; returnPath; productId; selection: Selection; quantity}`, `savePurchaseIntent(storage, intent)`, `readPurchaseIntent(storage, id): PurchaseIntent|null`, `clearPurchaseIntent(storage)` ส่วน `resumePurchaseIntent(api, token, intent): Promise<CartDto>` เรียก `addCartItem` ครั้งเดียวแล้วลบ intent ก่อนคืนค่า (ทั้งตอนสำเร็จและตอน error 4xx)
- Produces (checkout key): `readCheckout(storage, eventCode, buyerId): {key: string|null; draft: RecipientDraft|null}`, `ensureCheckoutKey(storage, eventCode, buyerId): string` (throw `merchandiseFailure(0,"MERCH_STORAGE_UNAVAILABLE")` ถ้าเขียนไม่ได้), `saveRecipientDraft(storage, eventCode, buyerId, draft)`, `clearCheckout(storage, eventCode, buyerId, {keepDraft?: boolean})`, `clearForeignCheckouts(storage, buyerId)` และ storage key เป็น `pris_merchandise_checkout:<buyerId>:<eventCode>`
- Produces (payment): `DeadlineAnchor` และ `deadlineRemainingMs` (คงเดิม), `anchorFrom(view: PaymentView, monotonicNow: number): DeadlineAnchor`, `formatPaymentRemaining(ms)` (คงเดิม), `type PanelModel = {state: PaymentState | "creating" | "checking"; title: string; message: string | null; showQr: boolean; primary: "request_qr" | "check" | null}` และ `panelModel(view: PaymentView, local: {busy: "creating"|"checking"|null; expiredLocally: boolean}, orderNumber: string): PanelModel` ที่ข้อความตรงกับตาราง spec §7.2 ทุกตัวอักษร รวมถึง `ORDER_POLL_MS = 10_000` และ `CHECK_COOLDOWN_MS = 5_000`

- [ ] **Step 1: เขียน test ที่ fail**
  - checkout key: เรียก `ensureCheckoutKey` สองครั้งได้ key เดิม, storage ที่ `setItem` throw → throw `MERCH_STORAGE_UNAVAILABLE`, buyer คนละคนได้ key คนละตัว, `clearForeignCheckouts(storage, 7)` ลบของ buyer 8 แต่คงของ 7, `clearCheckout(...,{keepDraft:true})` คง draft แต่ลบ key
  - intent: ถ้า `resumePurchaseIntent` ได้ 422 จาก fake api → reject และ `readPurchaseIntent` คืน null
  - payment: ทั้ง 8 state ได้ `title`/`message`/`primary` ตามตาราง (`qr_expired_open` → title `"QR หมดอายุ"` primary `"request_qr"` เฉพาะเมื่อ `canRequestNewQr`, `qr_expired_closed` → message `"หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว"` primary `null`, `review` → message มี `pr@pharmacycouncil.org` และเลขออเดอร์), `qr_active` + `expiredLocally:true` → state `"verifying"` และ `showQr:false`, `busy:"creating"` → title `"กำลังสร้าง QR"`
  - `deadlineRemainingMs` ที่ anchor ใหม่จาก `anchorFrom` หลัง serverNow เดินไป 300 วินาที → คืนเวลาที่น้อยลงตาม serverNow ใหม่ (Review Focus 1, ส่วนตรรกะ)
- [ ] **Step 2:** รัน 3 ไฟล์ test → FAIL
- [ ] **Step 3:** Implement
- [ ] **Step 4:** รัน test → PASS แล้วรัน `npm run test:merchandise` (unit ทั้งหมดของร้าน) → PASS
- [ ] **Step 5:** Commit `feat(merchandise): checkout key storage, intents and payment panel model`

### Task 6: Fake API สำหรับ Playwright

**Files:**
- Create: `tests/merchandise/fakeApi.ts`
- Rewrite: `tests/merchandise/data.ts`, `tests/merchandise/fixtures.ts`
- Modify: `playwright.merchandise.config.ts`

**Interfaces:**
- Produces: `class FakeMerchApi` ที่ถือ state ในหน่วยความจำ `{store: StoreDto; products: ProductDto[]; cart: CartDto; orders: Map<string, OrderDetail>; calls: {method: string; path: string; headers: Record<string,string>; body: unknown}[]}` พร้อม
  - `install(context: BrowserContext, origin: string)`: ใช้ `context.route` ดัก `${origin}/api/v1/merchandise/**` (และ `/api/auth/**` ที่หน้า login/SSO ใช้ โดยตอบแบบเดียวกับ mock ใน `route-login.spec.ts` เดิม)
  - `failNext(method, pathPattern, response: {status: number; body?: unknown} | "network")`
  - `setPayment(orderId, view: Partial<PaymentView>)`
  - การทำงานของ cart/order: เพิ่มลงตะกร้าแล้วรวมรายการซ้ำ, `cartVersion` เปลี่ยนทุกครั้งที่แก้, POST orders ตรวจ `cartVersion` (ไม่ตรง → 409 `MERCH_CART_CHANGED`) และ replay ด้วย key เดิม (`replayed:true`) แล้วล้างตะกร้า, ร้านไม่ `open` → 409 `MERCH_PREORDER_CLOSED`
- Produces (`fixtures.ts`): `test` ที่มี fixture `fake: FakeMerchApi` (install อัตโนมัติ) และ `login(page, {id?: number})` ที่เขียน `pris_user`/`pris_token` ลง `localStorage` ด้วย `addInitScript`
- Produces (`data.ts`): builder `makeStore(o?)`, `makeSingle(o?)`, `makeOptionsProduct(o?)`, `makeBundle(o?)`, `makeOrder(o?)`, `qrActive(o?)` ที่คืน DTO ซึ่ง type-check กับ `src/types/merchandise.ts` และ `qrPayload` ตัวอย่างเป็นสตริง EMVCo PromptPay สังเคราะห์ (ไม่ใช่ของจริง)
- Config: projects `chromium` (Desktop Chrome), `webkit` (Desktop Safari), `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 14) โดย `webServer.env.NEXT_PUBLIC_API_URL = "http://127.0.0.1:3103"` (origin ปลอม ไม่มี server จริง)

- [ ] **Step 1:** เขียน `tests/merchandise/fake-api.spec.ts` แบบสั้น: เปิด `/th/souvenirs` ด้วย store `open` + สินค้า 1 รายการ แล้วคาดว่า `fake.calls` มี `GET .../events/PRIS-2026/store`
- [ ] **Step 2:** `npx playwright test -c playwright.merchandise.config.ts fake-api --project=chromium` → FAIL (ยังไม่มี FakeMerchApi)
- [ ] **Step 3:** Implement fake, fixtures, data และ config
- [ ] **Step 4:** รันซ้ำ → spec นี้ PASS (ข้อความบนหน้าอาจยังผิดได้จนถึง Task 7 ตอนนี้ตรวจแค่การเรียก API)
- [ ] **Step 5:** Commit `test(merchandise): stateful fake API for browser tests`

### Task 7: Storefront, หน้าสินค้า และตะกร้า

**Files:**
- Create: `src/components/merchandise/StorefrontView.tsx`, `StoreHeaderTools.tsx`, `storefront-icons.tsx`, `storefront-view.css` ซึ่งคัดลอกจาก `git -C ../conference-backoffice show backup/merchandise-preorder-2026-10-16:packages/merchandise-storefront-view/src/<file>` แล้วปรับเป็น DTO ใหม่ตาม spec §6.1
- Modify: `StorefrontClient.tsx`, `MerchandiseHeaderTools.tsx`, `MerchandiseProvider.tsx`, `useMerchandiseResource.ts`, `useMerchandiseCart.ts`, `ProductDetail.tsx`, `ProductDetailClient.tsx`, `VariantSelector.tsx`, `BundleSelector.tsx`, `CartScreen.tsx`, `CartRow.tsx`, `MerchandiseAuthBoundary.tsx` (intent resume และ cleanup ตอนล็อกเอาต์/เปลี่ยนบัญชีที่เรียก `clearPurchaseIntent` + `clearForeignCheckouts`), `src/app/[locale]/souvenirs/layout.tsx` (import css ใหม่)
- Modify: `package.json`/`package-lock.json` (ลบ `@conference/merchandise-storefront-view`), delete `vendor/conference-merchandise-storefront-view-1.0.0.tgz`
- Test: rewrite `tests/merchandise/storefront.spec.ts`, `product-selection.spec.ts`, `cart.spec.ts`, `cart-layout.spec.ts`, `storefront-accessibility.spec.ts`, `storefront-reflow.spec.ts`

**Interfaces:**
- Consumes: `filterCatalog`, `Selection` helpers (Task 4), `PurchaseIntent` helpers (Task 5), `merchandiseApi` (Task 3)
- Produces: `useMerchandise()` คืน `{eventCode; token; ownerId: number|null; api; store: MerchandiseResource<StoreDto>; cart: MerchandiseResource<CartDto>; setCart(c: CartDto): void}` ซึ่ง Task 8–10 ใช้

- [ ] **Step 1: เขียน spec ที่ fail**
  - storefront: store `not_open` แสดง “ยังไม่เปิดรับพรีออเดอร์” และไม่มีปุ่มเพิ่ม, `closed` แสดง “ปิดรับพรีออเดอร์แล้ว”, `disabled` แสดง “ร้านยังไม่เปิดให้บริการ”, พิมพ์ค้นหาแล้ว URL มี `q=` และรายการถูกกรองโดยไม่ยิง request ใหม่ไปที่ `/products`, banner ที่มี `linkUrl` เป็นลิงก์, ราคา `from` แสดง “เริ่มต้น ฿…”
  - product: สินค้าไม่มีตัวเลือกไม่มี select, สินค้ามีตัวเลือกปิดปุ่มเพิ่มจนกว่าจะเลือกครบ แล้ว POST cart ที่ได้มี `variantId` ถูกตัว, Bundle ส่ง `bundleSelections` เฉพาะ selectable, `purchasable:false` + `COMPONENT_UNAVAILABLE` แสดง “สินค้าในชุดบางรายการปิดการขาย”
  - intent: ยังไม่ล็อกอินแล้วกดเพิ่ม → ไป `/th/login?redirect=…intentId=…` → login (mock) → กลับหน้าสินค้า → `fake.calls` มี POST cart items **ครั้งเดียว** และ toast “เพิ่มลงตะกร้าแล้ว”
  - cart: แก้จำนวนแล้วยอดที่แสดงตรงกับ `amounts` ใน response, รายการ `valid:false` ปิดปุ่ม “ดำเนินการสั่งซื้อ”, **รายการ `product:null` แสดง “สินค้านี้ไม่มีแล้ว” พร้อมปุ่มลบ และกดลบได้ (Review Focus 5)**
  - คง case a11y/reflow เดิม (ชื่อปุ่ม, focus, เป้ากด 44px, ไม่มี horizontal scroll ที่ 320px)
- [ ] **Step 2:** `npx playwright test -c playwright.merchandise.config.ts storefront product-selection cart --project=chromium` → FAIL
- [ ] **Step 3:** ย้าย renderer แล้วปรับ component และ hooks ตาม spec §6.1–6.3 ข้อความ `unavailableCodes`/`issueCodes` ใช้ map เดียวใน `src/lib/merchandiseSelection.ts` (`unavailableMessage(code, storeState): string`) แล้วลบ dependency tgz และรัน `npm install`
- [ ] **Step 4:** รัน spec ชุดนี้ทั้ง 4 projects → PASS และ `npm run test:merchandise` → PASS
- [ ] **Step 5:** Commit `feat(merchandise): storefront, product and cart on the new API`

### Task 8: Checkout 2 ขั้นและการยืนยันออเดอร์

**Files:**
- Modify: `CheckoutScreen.tsx`, `RecipientForm.tsx`, `src/app/[locale]/souvenirs/checkout/page.tsx` (ถ้าต้องเปลี่ยน props)
- Create: `src/components/merchandise/useMerchandiseCheckout.ts` (แทน `useMerchandiseConfirmation.ts` ซึ่งลบทิ้ง)
- Test: rewrite `tests/merchandise/checkout-address.spec.ts`, `order-confirmation.spec.ts`

**Interfaces:**
- Consumes: `validateRecipient`, `emptyRecipient` (Task 4), checkout key helpers (Task 5), `errorAction` (Task 3), `useMerchandise` (Task 7)
- Produces: `useMerchandiseCheckout()` คืน `{step: "recipient"|"review"; draft; setDraft; errors; toReview(): void; back(): void; cart: CartDto|null; status: "idle"|"submitting"|"uncertain"|"error"; message: string|null; confirm(): Promise<void>; retry(): Promise<void>}` ซึ่ง `confirm` และ `retry` ใช้ key ที่เก็บไว้เสมอ และเมื่อสำเร็จจะ `router.replace("/souvenirs/orders/" + id)` พร้อมฝาก `OrderDetail` ไว้ใน module cache `primeOrder(order)` ที่ Task 9 อ่าน

- [ ] **Step 1: เขียน spec ที่ fail**
  - prefill จาก `buyerDefaults`, ช่องผิดแสดงข้อความและโฟกัสช่องแรกที่ผิด, รีเฟรชระหว่างขั้นแล้วร่างยังอยู่
  - ขั้นตรวจสอบแสดงยอดจาก GET cart ใหม่ และ POST orders มี `cartVersion` ตัวนั้นกับ `recipient` ที่ normalize แล้ว (`phone:"0812345678"`, `company:null`)
  - `Idempotency-Key` ถูกเขียนลง sessionStorage ก่อน POST (ตรวจใน route handler ด้วย `page.evaluate` ว่า key อยู่ใน storage แล้ว)
  - `failNext("POST", /orders$/, "network")` → แสดง “ยังไม่ทราบผลการยืนยัน” → กด “ลองอีกครั้ง” → POST ที่สองใช้ header key เดียวกัน และ fake ตอบ `replayed:true` → ไปหน้าออเดอร์
  - 409 `MERCH_CART_CHANGED` → กลับขั้นตรวจสอบพร้อม “ตะกร้ามีการเปลี่ยนแปลง กรุณาตรวจสอบอีกครั้ง”
  - store `closed` ตอน POST → “ปิดรับพรีออเดอร์แล้ว” และปุ่มถูกปิด
  - 422 `MERCH_IDEMPOTENCY_KEY_REUSED` → การยืนยันครั้งถัดไปใช้ key ใหม่
  - storage ที่ `setItem` throw (`addInitScript` override) → ไม่มี POST และแสดงข้อความให้เปิดการใช้ storage
  - **double-click ปุ่มยืนยัน → POST ครั้งเดียว (Review Focus 2)**
  - **401 ตอน POST → ไปหน้า login → กลับมา checkout → ร่างยังอยู่ และ “ลองอีกครั้ง” ใช้ key เดิม (Review Focus 3)**
  - **สร้างออเดอร์แล้วกด Back → เห็นตะกร้าว่าง ไม่มี error (Review Focus 4)**
- [ ] **Step 2:** `npx playwright test -c playwright.merchandise.config.ts checkout-address order-confirmation --project=chromium` → FAIL
- [ ] **Step 3:** Implement hook และหน้าจอตาม spec §6.4 กรณี 401 ใช้ `clearCheckout` ไม่ได้ (key + draft ต้องคงไว้) แล้วพาไป `merchandiseLoginPath(currentPath, true)`
- [ ] **Step 4:** รันทั้ง 4 projects → PASS
- [ ] **Step 5:** Commit `feat(merchandise): two-step checkout with idempotent confirmation`

### Task 9: PaymentPanel และหน้าออเดอร์

**Files:**
- Create: `src/components/merchandise/PaymentQr.tsx`, `src/components/merchandise/usePaymentPolling.ts`
- Rewrite: `PaymentPanel.tsx`, `usePaymentDeadline.ts`
- Modify: `OrderScreen.tsx`, `PaidOrder.tsx`, `useMerchandiseOrder.ts`, `order.css` (เพิ่มเฉพาะ style ที่จำเป็น)
- Delete: `useOwnerQr.ts`
- Test: rewrite `tests/merchandise/payment-state.spec.ts`

**Interfaces:**
- Consumes: `panelModel`, `anchorFrom`, `deadlineRemainingMs`, `ORDER_POLL_MS`, `CHECK_COOLDOWN_MS` (Task 5), `errorAction` (Task 3), `primeOrder` cache (Task 8)
- Produces: `<PaymentQr payload: string; orderNumber: string />` (render `<img>` dataURL และลิงก์ download), `usePaymentPolling(orderId: string, initial: OrderDetail): {order: OrderDetail; busy: "creating"|"checking"|null; expiredLocally: boolean; remainingMs: number|null; requestQr(): Promise<void>; check(): Promise<void>; notice: string|null}`

- [ ] **Step 1: เขียน spec ที่ fail**
  - เปิดออเดอร์ที่ทั้ง 8 state แต่ละ state แสดงหัวข้อ/ข้อความ/ปุ่มตรงตามตาราง spec §7.2 ทุกตัวอักษร
  - `qr_active`: มี `<img alt="QR สำหรับชำระเงินคำสั่งซื้อ PRIS2026-M-000001">` ถอดภาพจาก `src` ด้วย `jsqr` ใน test (เพิ่ม `jsqr` เป็น devDependency) แล้วได้ `qrPayload` เดิม, ลิงก์ download ชื่อ `souvenir-payment-PRIS2026-M-000001.png`, ไม่มี `qrPayload` ใน `localStorage`/`sessionStorage`/URL
  - นับถอยหลัง: `serverNow` ห่าง `expiresAt` 3 วินาที → ภายใน 5 วินาที QR หายและเห็น “กำลังตรวจสอบการชำระ กรุณารอสักครู่” และมี `POST payment-checks` หนึ่งครั้ง
  - polling: ขณะ `qr_active` เกิด `GET /orders/:id` ซ้ำ (ใช้ `page.clock` เดินเวลา 10 วินาที) และเมื่อ fake เปลี่ยนเป็น `paid` จะเห็น “ชำระเงินสำเร็จ” แล้ว polling หยุด
  - `visibilitychange` (ใช้ `page.evaluate` ซ่อน/แสดง) → `POST payment-checks` และกลับมาซ้ำภายใน 5 วินาทีไม่ยิงซ้ำ
  - **กลับมาแสดงหลังซ่อนนาน: view ใหม่ที่ `serverNow` เดินไป 9 นาที → เวลาเหลือที่แสดง ≤ 1:00 (Review Focus 1)**
  - “ขอ QR ใหม่” ที่ `qr_expired_open` → `POST payment-attempts` แล้วเห็น QR ใหม่, 409 `MERCH_PAYMENT_VERIFYING` (`details.retryAfterSeconds: 3`) → verifying แล้วตรวจใหม่หลัง 3 วินาที, 503 `MERCH_PAYMENT_UNAVAILABLE` → “ระบบชำระเงินยังไม่พร้อม กรุณาลองใหม่ภายหลัง”
  - ออเดอร์ที่ fake ตอบ 404 → “ไม่พบคำสั่งซื้อ” + ลิงก์ไปประวัติ
  - `paid` + shipped แสดง carrier และ tracking `"0012345"` ตรงตัว รวมถึงคำแนะนำถ่ายวิดีโอและ pr@pharmacycouncil.org
- [ ] **Step 2:** `npx playwright test -c playwright.merchandise.config.ts payment-state --project=chromium` → FAIL
- [ ] **Step 3:** Implement ตาม spec §7 (`QRCodeCanvas` level `M` size 560 `marginSize 4` วาดนอกจอ แล้วใช้ `canvas.toDataURL("image/png")` ใน effect)
- [ ] **Step 4:** รันทั้ง 4 projects → PASS
- [ ] **Step 5:** Commit `feat(merchandise): client-rendered PromptPay QR and payment states`

### Task 10: ประวัติออเดอร์, Navbar และ login redirect

**Files:**
- Modify: `OrderHistory.tsx`, `OrderRecord.tsx`, `OrderStatus.tsx`, `src/lib/merchandiseRoutes.ts(+test)` (คง allowlist ส่วน `intentId` ยังใช้อยู่)
- Test: rewrite `tests/merchandise/order-history.spec.ts`, `route-login.spec.ts`, ปรับ fixture ใน `legacy-regression.spec.ts`, `accessibility.spec.ts`

- [ ] **Step 1: เขียน spec ที่ fail**
  - history: `pending`/`paid`/`expired` แสดง “รอชำระเงิน”/“ชำระแล้ว”/“หมดเวลาชำระ” แยกกับ “ยังไม่จัดส่ง”/“จัดส่งแล้ว”, `page=2` อยู่ใน URL หลังรีเฟรช, ไม่มี `GET /orders/:id` จากหน้าประวัติ, empty state
  - route-login: Navbar มีลิงก์ “ของที่ระลึก” → `/th/souvenirs` เปิดตรงๆ ทั้ง `/th/souvenirs/cart`, `/th/souvenirs/checkout`, `/th/souvenirs/orders`, `/th/souvenirs/orders/<id>` โดยยังไม่ล็อกอิน → login → กลับ path เดิม, redirect ที่ไม่ปลอดภัย (`//evil.example`) ไม่ถูกส่งต่อ
  - LINE: context ที่ตั้ง userAgent เป็น LINE iOS (`... Line/14.0.0`) และ Android เปิด `/th/souvenirs/products/<id>` ได้ เพิ่มลงตะกร้าหลังล็อกอินได้ และหน้า QR มี `<img>` ที่กดค้างได้ (ไม่มี `pointer-events:none`/`user-select` บล็อก)
- [ ] **Step 2:** `npx playwright test -c playwright.merchandise.config.ts order-history route-login --project=chromium` → FAIL
- [ ] **Step 3:** Implement ตาม spec §6.6 และ §8
- [ ] **Step 4:** รัน spec ทั้งหมดของ e2e (`npm run test:e2e:merchandise`) → PASS
- [ ] **Step 5:** Commit `feat(merchandise): order history and entry/return paths`

### Task 11: ตรวจของค้างจาก contract เก่า

**Files:** ทั่ว `src/` และ `tests/merchandise/`

- [ ] **Step 1:** `git grep -nE "quoteToken|QuoteDto|orderRequest|order-requests|qrAvailable|effectiveRevision|originalRevision|expectedRevision|preorderOpensAt|sizeInfoTh|optionMode|merchandise-storefront-view" -- src tests package.json` ต้องว่าง (ยกเว้น `docs/design`)
- [ ] **Step 2:** `git grep -n "qrPayload" -- src` ต้องเจอเฉพาะ types, validator, `merchandisePayment.ts`, `PaymentPanel.tsx`, `PaymentQr.tsx` และไม่มี `console.` หรือ `Storage` อยู่ใกล้
- [ ] **Step 3:** แก้สิ่งที่เจอ แล้ว commit `refactor(merchandise): remove leftovers of the retired contract` (ถ้าไม่มีอะไรให้แก้ก็ข้าม commit)

### Task 12: Verification รวมและ smoke กับ API จริง

- [ ] **Step 1:** `npx tsc --noEmit` → ไม่มี error
- [ ] **Step 2:** `npm run lint` → จำนวน error/warning ไม่มากกว่า baseline ของ Task 1 และไฟล์ merchandise ไม่มี finding ใหม่
- [ ] **Step 3:** `npm test` และ `npm run test:merchandise` → PASS
- [ ] **Step 4:** `npm run test:e2e:merchandise` ทั้ง 4 projects → PASS
- [ ] **Step 5:** `npm run build` → สำเร็จ
- [ ] **Step 6: Smoke** รัน conference-api `feat/merchandise-preorder` ในเครื่อง (ตาม `../conference-api/docs/merchandise-runbook.md` ข้อ 1, 4 กับ DB dev) ห้ามสลับ branch ของ conference-api ถ้า checkout ไม่ได้อยู่ที่ branch นั้น ให้หยุดแล้วถามผู้ใช้ จากนั้นรัน Pris ด้วย `NEXT_PUBLIC_API_URL` ชี้ไปที่ API นั้น แล้วเดิน flow: ร้าน → สินค้า → ตะกร้า → checkout → หน้าออเดอร์ บันทึกผล (รวมถึงการเห็น `awaiting_qr`/“ระบบชำระเงินยังไม่พร้อม” เมื่อไม่ได้ตั้ง env PaySolution) ใน `docs/verification/merchandise-user-test/smoke-local.md`
- [ ] **Step 7:** เขียน `docs/verification/merchandise-user-test/checklist.md` โดยคัดลอกตารางอุปกรณ์และ 7 ข้อจาก spec §11.4 เป็น checkbox ให้ผู้ใช้ติ๊กตอน User Test จริง
- [ ] **Step 8:** Commit `docs(merchandise): local smoke result and user test checklist` (ไม่ push)
