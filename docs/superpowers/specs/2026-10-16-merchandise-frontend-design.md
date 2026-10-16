# Merchandise Preorder — Pris2026 Frontend Design

- **วันที่:** 16 ตุลาคม 2026
- **Repo / branch:** Pris2026 `feat/merchandise-preorder` (ไม่แก้ `main` ไม่ push)
- **ขอบเขต:** ปรับ UI ร้านของที่ระลึกที่มีอยู่บน branch นี้ให้ใช้ API ใหม่ ส่วน Backoffice มี spec แยก
- **Contract อ้างอิง:** `conference-api/docs/superpowers/specs/2026-10-16-merchandise-api-design.md` (§6.5, §7.5–7.6, §8, §8.5) และ `conference-api/src/modules/merchandise/types.ts` บน branch `feat/merchandise-preorder` (commit `25cd3fb`) ซึ่งเป็นต้นฉบับของ DTO

---

## 1. เป้าหมายและเกณฑ์สำเร็จ

UI ร้าน (`/[locale]/souvenirs/*`) เดิมถูกสร้างบน contract เก่า (quoteToken, order-requests, `GET /qr` เป็น PNG, revision แบบ original/effective, Minor เป็น string) เป้าหมายคือคงหน้าจอ หน้าตา และ a11y ที่ทำไว้แล้ว แต่เปลี่ยนชั้นข้อมูลทั้งหมดให้ตรงกับ API ใหม่

เกณฑ์สำเร็จ:

1. ผู้ซื้อที่ล็อกอินแล้วเลือกสินค้าเดี่ยวและ Bundle ใส่ตะกร้า กรอกผู้รับ ตรวจสอบ และยืนยันออเดอร์ได้ ยอดทั้งหมดมาจาก server (สตางค์ integer)
2. หน้าออเดอร์วาด QR จาก `qrPayload` เอง และแสดงทั้ง 8 state ของ `PaymentView` ด้วยข้อความภาษาไทยตามที่ตกลง
3. การยืนยันซ้ำเพราะเครือข่ายไม่แน่นอนไม่ทำให้เกิดออเดอร์ซ้ำ (Idempotency-Key)
4. เข้าร้านได้จาก Navbar “ของที่ระลึก” และลิงก์ LINE OA (เปิดใน LINE in-app browser) ทุกหน้าเปิดตรงจากลิงก์ได้ และถ้ายังไม่ล็อกอินจะกลับมาหน้าเดิมหลังล็อกอิน
5. ผ่าน unit test, Playwright (API mock) และ User Test บน iPhone, Android, LINE in-app และคอมพิวเตอร์

## 2. บันทึกการตัดสินใจ

| เรื่อง | ข้อสรุป |
|---|---|
| แนวทาง | ปรับของเดิม: คงหน้าจอ/CSS/component และเปลี่ยน types → client → validator → hooks |
| Base ของ branch | rebase ลง `origin/main` ก่อนเริ่ม (ตามหลัง 5 commit, `merge-tree` ไม่ชน, branch ยังไม่เคย push) |
| Storefront renderer | ย้าย source `StorefrontView`/`StoreHeaderTools` จาก `conference-backoffice` branch `backup/merchandise-preorder-2026-10-16` (`packages/merchandise-storefront-view/src`) มาไว้ใน Pris แล้วลบ `vendor/*.tgz` Backoffice ทำ preview เอง |
| ของเก่า | ลบหลักฐาน/gate/fixture ของ contract เก่า เก็บ `docs/design/merchandise/**` (mockup) ไว้เป็นข้อมูลอ้างอิงด้านหน้าตา |
| Checkout | 2 ขั้นเหมือนเดิม: ข้อมูลผู้รับ → ตรวจสอบคำสั่งซื้อ ไม่มี quote API ยอดในขั้นตรวจสอบมาจาก GET cart |
| ค้นหาสินค้า | API ไม่มี `search` จึงโหลดสินค้า published ทั้งหมด (`limit=100`) แล้วค้นหา/กรองฝั่ง client |
| QR | วาดจาก `qrPayload` ด้วย `qrcode.react` (มีใน `main` แล้ว) แสดงเป็น `<img>` dataURL |
| LINE OA | เปิดใน LINE in-app browser ไม่ใส่ `openExternalBrowser` |
| Response validation | validator ที่เขียนเอง (รูปแบบเดิมของ `merchandiseResponse.ts`) ไม่เพิ่ม dependency |
| ภาษา | ข้อความในร้านและข้อมูลสินค้าเป็นภาษาไทย `/en/souvenirs` ใช้ได้แต่ส่วนร้านยังเป็นไทย |

## 3. Git และการเตรียม branch

1. `git rebase origin/main` บน `feat/merchandise-preorder` แล้วรัน `npm test`, `npx tsc --noEmit` และ `npm run build` เพื่อยืนยันว่า base ใหม่ไม่ทำให้ของเดิมพัง
2. ห้ามแก้ `main` ห้าม push ทุก commit อยู่บน branch นี้
3. ถ้า rebase ชน (ไม่คาดว่าจะชน) ให้หยุดและรายงานก่อนแก้

## 4. โครงสร้างไฟล์หลังปรับ

```
src/types/merchandise.ts            DTO ผู้ซื้อ (สำเนาจาก API types.ts) + Page<T>, ApiFailure
src/lib/merchandiseApi.ts           client: endpoint ตาม §8.1–8.2 เท่านั้น
src/lib/merchandiseResponse.ts      validator ของทุก DTO
src/lib/merchandiseFormat.ts        formatMinorBaht(number), เวลาไทย, isIsoUtc
src/lib/merchandiseErrors.ts        map code → action ของ UI (ส่วนที่ 9)
src/lib/merchandiseCatalog.ts       ค้นหา/กรองสินค้าฝั่ง client
src/lib/merchandiseSelection.ts     ตัวเลือก variant / bundle selections
src/lib/merchandiseIntent.ts        intent เพิ่มลงตะกร้าก่อนล็อกอิน (ตัดฟิลด์ revision)
src/lib/merchandiseCheckoutKey.ts   เก็บ Idempotency-Key ใน sessionStorage (แทน merchandiseOrderRequest.ts)
src/lib/merchandiseRecipient.ts     ตรวจผู้รับตาม recipient schema ของ API
src/lib/merchandisePayment.ts       นับถอยหลัง, PaymentView → โมเดลการแสดงผล
src/lib/merchandiseRoutes.ts        return path ที่อนุญาต (คงเดิม)
src/components/merchandise/
  StorefrontView.tsx, StoreHeaderTools.tsx, storefront-view.css, icons.tsx   (ย้ายมาจาก package)
  PaymentPanel.tsx, PaymentQr.tsx   วาด QR จาก payload
  usePaymentPolling.ts              polling + payment-checks
  ... หน้าจออื่นคงชื่อเดิม
```

ไฟล์ที่ลบ: `src/lib/merchandiseOrderRequest.ts(+test)`, `src/lib/merchandiseContract.test.ts`, `src/lib/merchandiseStartGate.test.ts`, `src/components/merchandise/useOwnerQr.ts`, โค้ด quote/revision ทั้งหมด, `vendor/conference-merchandise-storefront-view-1.0.0.tgz` และ dependency `@conference/merchandise-storefront-view` ใน `package.json`

## 5. ชั้นข้อมูล

### 5.1 Types

- `src/types/merchandise.ts` คัดลอกเฉพาะ DTO ฝั่งผู้ซื้อจาก API `types.ts`: `Minor`, `ImageAsset`, `StoreDto`, `VariantDto`, `BundleComponentDto`, `ProductDto`, `BundleSelection`, `CartLine`, `Amounts`, `CartDto`, `Recipient`, `OrderItemDto`, `OrderSummary`, `PaymentState`, `PaymentView`, `OrderDetail` ไม่คัดลอก Admin DTO หรือ `MerchRouteOptions`
- หัวไฟล์ระบุ path และ commit ต้นฉบับ (`conference-api@25cd3fb`) และห้ามแก้ชื่อหรือรูปร่าง ถ้า API เปลี่ยนให้คัดลอกใหม่
- เพิ่มเฉพาะ type ของ envelope: `ApiSuccess<T> = {success:true, data:T}`, `ApiFailure = {success:false, code, error, requestId, details?}`, `Page<T> = {items: T[], pagination:{page, limit, total, totalPages}}`

### 5.2 API client (`merchandiseApi.ts`)

ทุก path อยู่ใต้ `${NEXT_PUBLIC_API_URL}/api/v1/merchandise`, `eventCode` มาจาก `NEXT_PUBLIC_EVENT_CODE ?? "PRIS-2026"` (เหมือนเดิม)

| ฟังก์ชัน | Request | คืน |
|---|---|---|
| `store(eventCode)` | `GET /events/:eventCode/store` | `StoreDto` |
| `products(eventCode, {categoryId?, kind?, page?, limit?})` | `GET /events/:eventCode/products` | `Page<ProductDto>` |
| `product(eventCode, id)` | `GET /events/:eventCode/products/:id` | `ProductDto` |
| `cart(eventCode, token)` | `GET /events/:eventCode/cart` | `CartDto` |
| `addCartItem(eventCode, token, {productId, variantId, bundleSelections, quantity})` | `POST .../cart/items` | `CartDto` |
| `updateCartItem(eventCode, token, itemId, {quantity?, variantId?, bundleSelections?})` | `PATCH .../cart/items/:itemId` | `CartDto` |
| `removeCartItem(eventCode, token, itemId)` | `DELETE .../cart/items/:itemId` | `CartDto` |
| `createOrder(eventCode, token, key, {cartVersion, recipient})` | `POST /events/:eventCode/orders` + header `Idempotency-Key` | `{order: OrderDetail, replayed: boolean}` |
| `orders(eventCode, token, {page?, limit?})` | `GET /events/:eventCode/orders` | `Page<OrderSummary>` |
| `order(token, orderId)` | `GET /orders/:orderId` | `OrderDetail` |
| `checkPayment(token, orderId)` | `POST /orders/:orderId/payment-checks` | `{payment: PaymentView}` |
| `requestQr(token, orderId)` | `POST /orders/:orderId/payment-attempts` | `{payment: PaymentView}` |

- request ที่มี token ใส่ `Authorization: Bearer`, `cache: "no-store"` และรับ `AbortSignal`
- ตรวจ id เป็น UUID และ `Idempotency-Key` ตรง `^[A-Za-z0-9_-]{1,100}$` ก่อนส่ง
- ผลลัพธ์ผ่าน validator เสมอ ถ้าไม่ผ่านโยน `MerchandiseApiError(status, {code:"MERCH_BAD_RESPONSE"})`
- ข้อผิดพลาดจาก server เก็บ `status`, `code`, `error` (ข้อความภาษาไทยที่แสดงได้), `details`
- network error/timeout/5xx ตั้ง `uncertain = true` (ใช้ตัดสินการส่งซ้ำของ createOrder)

### 5.3 Validator (`merchandiseResponse.ts`)

- ใช้ helper เดิม (`record`, `text`, `integer`, `uuid`, …) เขียน check ของทุก DTO ข้างบน
- `Minor` = `Number.isSafeInteger(v) && v >= 0` ส่วน `shippingMinor` ต้องเป็น `5000` และ `currency` ต้องเป็น `"THB"`
- เวลาเป็น ISO 8601 UTC (`isIsoUtc`) หรือ `null` ตาม type
- enum ทุกตัว (`state`, `kind`, `mode`, `paymentStatus`, `shipping.status`, `PaymentState`) ตรวจค่าที่อนุญาต ค่าที่ไม่รู้จักถือว่า response ผิด
- `PaymentView.attempt.qrPayload` ต้องเป็น string ไม่ว่างเมื่อ `state === "qr_active"` ถ้าไม่ใช่ `qr_active` จะยอมรับค่าใดก็ได้ แต่ UI ไม่ใช้

### 5.4 เงินและเวลา

- `formatMinorBaht(minor: number)` → `฿1,250.00` (ตามรูปแบบเดิม) ใช้ทุกจุดที่แสดงเงิน
- frontend ไม่คำนวณยอดเอง ใช้ `unitPriceMinor`, `lineTotalMinor` และ `amounts` จาก server ยกเว้นราคาที่แสดงตอนเลือก variant บนหน้าสินค้า (`variant.priceMinor ?? product.price.amountMinor` ตาม §6.3 ของ API)
- เวลาแสดงเป็นเวลาไทย (`Asia/Bangkok`) ด้วย `formatMerchandiseTime`

## 6. หน้าจอ

### 6.1 Storefront (`/souvenirs`)

- ใช้ `StorefrontView` ที่ย้ายมา แล้วเปลี่ยน props ให้ใช้ DTO ใหม่:
  - `preorderOpensAt` → `opensAt`, `sizeInfoTh` → `sizeChartTh`, `optionMode` → `hasOptions`
  - `Minor` เป็น number, `formatStoreMoney` → `formatMinorBaht`
  - ตัด `altTh`, `mobileImage`, `destination` → `linkUrl`, ตัด state `unconfigured`
- โหลด `store` และ `products(limit=100)` ครั้งเดียว `merchandiseCatalog.ts` กรองตาม `q` (ชื่อ ไม่สนตัวพิมพ์), `categoryId`, `kind` และแบ่งหน้าฝั่ง client (12 รายการต่อหน้า) โดยเก็บ `q`/`categoryId`/`kind`/`page` ใน URL (allowed keys ใน `merchandiseRoutes` คงเดิม)
- ถ้า `pagination.total > 100` ให้โหลดหน้าถัดไปต่อจนครบ (กันพลาด แม้คาดว่าจะไม่เกิน)
- Banner: รูปเดียวต่อรายการ ถ้ามี `linkUrl` จะเป็นลิงก์
- สถานะร้าน: `open` → ปุ่มเพิ่มลงตะกร้าตาม `purchasable`, `not_open` → “ยังไม่เปิดรับพรีออเดอร์” + เวลาเปิด (ถ้ามี), `closed` → “ปิดรับพรีออเดอร์แล้ว”, `disabled` → “ร้านยังไม่เปิดให้บริการ” ส่วนสถานะที่ไม่ใช่ `open` ยังดูสินค้าได้แต่ไม่มีปุ่มซื้อ
- `productionInfoTh`/`shippingInfoTh` แสดงเมื่อไม่เป็น null

### 6.2 หน้าสินค้า (`/souvenirs/products/:id`)

- `hasOptions=false`: ไม่แสดงช่องเลือก ใช้ variant ตัวแรกที่ `saleEnabled`
- `hasOptions=true`: เลือกไซซ์/สีจาก `variants` ที่ `saleEnabled` ต้องเลือกครบก่อนเพิ่ม ราคาเปลี่ยนตาม variant
- Bundle: แสดงทุก component (`nameTh × quantityPerBundle`) ถ้าเป็น `fixed` ให้แสดง `fixedVariant` เป็นข้อความ ถ้าเป็น `selectable` ต้องเลือกจาก `allowedVariants` ที่ `saleEnabled` ส่ง `bundleSelections` เฉพาะ component ที่เป็น `selectable`
- `purchasable=false` → ปิดปุ่มและแสดงข้อความตาม `unavailableCodes` (`STORE_NOT_OPEN` “ยังไม่เปิดรับพรีออเดอร์ / ปิดรับแล้ว” ตามสถานะร้าน, `PRODUCT_DISABLED` “สินค้านี้ปิดการขายชั่วคราว”, `VARIANT_DISABLED` “ตัวเลือกนี้ปิดการขาย”, `COMPONENT_UNAVAILABLE` “สินค้าในชุดบางรายการปิดการขาย”)
- จำนวน 1–9999
- ยังไม่ล็อกอินแล้วกด “เพิ่มลงตะกร้า” → ส่วนที่ 8.2

### 6.3 ตะกร้า (`/souvenirs/cart`)

- แสดง `items` พร้อมตัวเลือก (ชื่อไซซ์/สีจาก `product.variants` ตาม `variantId` และ `bundleSelections`), `unitPriceMinor`, `lineTotalMinor` และ `amounts`
- แก้จำนวน/ตัวเลือก → `PATCH` ลบ → `DELETE` และใช้ `CartDto` ที่ตอบกลับมาแทน state ทั้งก้อน (server รวมรายการซ้ำให้เอง)
- รายการ `valid=false` แสดง `issueCodes` เป็นข้อความไทย (ชุดเดียวกับ 6.2 รวม `product=null` → “สินค้านี้ไม่มีแล้ว”) พร้อมปุ่มลบ/แก้ตัวเลือก
- ปุ่ม “ดำเนินการสั่งซื้อ” ปิดเมื่อ `amounts === null`, ตะกร้าว่าง หรือร้านไม่ `open`
- Header แสดงจำนวนชิ้นจาก cart เดียวกัน (Provider เดิม) และไม่โหลด cart ซ้ำ

### 6.4 Checkout (`/souvenirs/checkout`) — 2 ขั้น

**ขั้น 1 ข้อมูลผู้รับ**
- ฟิลด์ตาม `Recipient` เติมค่าเริ่มต้นจาก `cart.buyerDefaults` (`fullName`, `phone`) ไม่บันทึกที่อยู่ลงบัญชี
- `merchandiseRecipient.ts` ตรวจตาม `recipientSchema` ของ API:
  - บังคับ `fullName` ≤200, `addressLine` ≤500, `subdistrict`/`district`/`province` ≤100
  - `phone` ล้างช่องว่าง/ขีด/วงเล็บ และ `+66`→`0` แล้วต้องตรง `^0\d{8,9}$`
  - `postalCode` `^\d{5}$`
  - `company` ≤200 และ `deliveryNote` ≤500 ไม่บังคับ ค่าว่างส่งเป็น `null`
- ข้อผิดพลาดผูกกับช่องและโฟกัสช่องแรกที่ผิด (พฤติกรรมเดิม)
- ข้อมูลที่กรอกเก็บใน sessionStorage ระหว่างขั้น (ต่อ buyer + event) เพื่อให้รีเฟรชหรือกลับจากหน้า login แล้วไม่หาย และลบเมื่อสร้างออเดอร์สำเร็จ

**ขั้น 2 ตรวจสอบคำสั่งซื้อ**
- โหลด GET cart ใหม่เมื่อเข้าขั้นนี้ แล้วแสดงรายการ ยอด ค่าส่ง ยอดรวม ผู้รับ “ชำระด้วย Thai QR PromptPay” และข้อมูลการผลิต/จัดส่ง (จาก store)
- เก็บ `cartVersion` จาก cart ที่แสดงอยู่ และปุ่ม “แก้ไข” กลับไปขั้น 1

**ยืนยัน**
1. ถ้ายังไม่มี key ของ (buyer, event) ใน sessionStorage → สร้าง `crypto.randomUUID()` แล้ว**เขียนลง storage ให้สำเร็จก่อน POST** (ถ้าเขียนไม่ได้ ไม่ส่ง และแจ้งให้เปิดการใช้ storage)
2. `createOrder(key, {cartVersion, recipient})` ระหว่างรอ ล็อกฟอร์มและปุ่ม
3. ได้ 201 → ลบ key และร่างผู้รับ → `router.replace(/souvenirs/orders/:id)` พร้อมส่ง `OrderDetail` ที่ได้ให้หน้าออเดอร์ (ไม่ต้องโหลดซ้ำทันที)
4. `uncertain` (network/timeout/5xx) → คง key ไว้ แสดง “ยังไม่ทราบผลการยืนยัน” + ปุ่ม “ลองอีกครั้ง” ที่ส่ง key และ body **เดิม** (server คืน `replayed: true` ถ้าออเดอร์ถูกสร้างไปแล้ว)
5. 4xx ที่จบแล้ว → ลบ key แล้วจัดการตามส่วนที่ 9
- ถ้าผู้ใช้กลับมาที่ checkout โดยยังมี key ค้างและร่างเดิม ให้แสดงสถานะ “ยังไม่ทราบผล” พร้อมปุ่มลองอีกครั้งแทนการสร้าง key ใหม่

### 6.5 หน้าออเดอร์ (`/souvenirs/orders/:id`)

- โหลด `order(id)` แสดงเลขออเดอร์ รายการ (รวม components ของ Bundle) ยอด ผู้รับ ข้อมูลการผลิต/จัดส่ง และ `PaymentPanel` (ส่วนที่ 7)
- ถ้า `paymentStatus === "paid"` ให้แสดง `PaidOrder` (สถานะจัดส่ง, carrier, tracking คงเลข 0 นำหน้า, `shippedAt`) และคำแนะนำให้ถ่ายวิดีโอขณะแกะพัสดุ พร้อมติดต่อ pr@pharmacycouncil.org
- ออเดอร์ของคนอื่นหรือไม่พบ (404) → “ไม่พบคำสั่งซื้อ” + ลิงก์ไปประวัติ

### 6.6 ประวัติ (`/souvenirs/orders`)

- `orders(page, limit=10)` เก็บ `page` ใน URL แต่ละรายการแสดงเลขออเดอร์ วันที่ (เวลาไทย) ยอดรวม สถานะชำระ (`pending` “รอชำระเงิน”, `paid` “ชำระแล้ว”, `expired` “หมดเวลาชำระ”) แยกจากสถานะจัดส่ง (“ยังไม่จัดส่ง” / “จัดส่งแล้ว” + carrier/tracking)
- ไม่โหลด detail ทีละรายการ ส่วน empty state ใช้แบบเดิม

## 7. PaymentPanel

### 7.1 การแสดง QR (`PaymentQr.tsx`)

- ใช้ `QRCodeCanvas` จาก `qrcode.react` วาด `attempt.qrPayload` (error level `M`, ขนาดภาพ 560px, แสดง 280px, มี quiet zone) นอกจอ แล้วแปลงเป็น dataURL ไปใส่ `<img alt="QR สำหรับชำระเงินคำสั่งซื้อ {orderNumber}">` เพื่อให้กดค้างเพื่อบันทึกได้ใน Safari, Chrome และ LINE in-app browser
- ปุ่ม “บันทึกภาพ QR” เป็น `<a download="souvenir-payment-{orderNumber}.png" href={dataUrl}>` และใต้ปุ่มมีข้อความเสมอ: “ถ้าบันทึกไม่ได้ ให้กดค้างที่รูป QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร”
- payload อยู่แค่ใน memory: ไม่เขียนลง storage ไม่ log ไม่ใส่ใน URL และ unmount เมื่อ state ไม่ใช่ `qr_active`

### 7.2 State → UI

| `state` | หัวข้อ | เนื้อหา | ปุ่ม |
|---|---|---|---|
| `awaiting_qr` | รอสร้าง QR | “ยังไม่มี QR สำหรับชำระเงิน” | “ขอ QR” เมื่อ `canRequestNewQr` |
| `qr_active` | รอชำระเงิน | QR, ยอดรวม, “เวลาชำระเงินคงเหลือ mm:ss”, “หมดอายุ HH:mm (เวลาไทย)”, คำแนะนำสแกน/บันทึกรูป | “บันทึกภาพ QR”, “ตรวจสอบการชำระเงิน” เมื่อ `canCheck` |
| `verifying` | กำลังตรวจสอบ | “กำลังตรวจสอบการชำระ กรุณารอสักครู่” | — |
| `qr_expired_open` | QR หมดอายุ | “QR หมดอายุ” | “ขอ QR ใหม่” เมื่อ `canRequestNewQr` |
| `qr_expired_closed` | หมดเวลาชำระเงิน | “หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว” | — |
| `check_failed` | ตรวจสอบไม่สำเร็จ | “ตรวจสอบไม่สำเร็จ กรุณาลองอีกครั้ง” | “ตรวจสอบอีกครั้ง” เมื่อ `canCheck` |
| `review` | รอเจ้าหน้าที่ตรวจสอบ | “รอเจ้าหน้าที่ตรวจสอบการชำระเงิน หากมีข้อสงสัยติดต่อ pr@pharmacycouncil.org พร้อมเลขออเดอร์ {orderNumber}” | — |
| `paid` | ชำระเงินสำเร็จ | “ชำระเงินสำเร็จ” → `PaidOrder` | — |

- ปุ่มแสดงตาม flag `canRequestNewQr`/`canCheck` จาก server เท่านั้น
- ระหว่างเรียก `requestQr` แสดง “กำลังสร้าง QR” และระหว่าง `checkPayment` แสดง “กำลังตรวจสอบ” (state ชั่วคราวฝั่ง client) โดยปิดปุ่มทั้งหมด
- ข้อความสถานะอยู่ใน `role="status"` และนับถอยหลังเป็น `role="timer"` `aria-live="off"`

### 7.3 นับถอยหลัง

- ใช้ `deadlineRemainingMs(expiresAt, anchor, now)` เดิม โดย anchor = `serverNow` ของ `PaymentView` ล่าสุดกับ `performance.now()` ตอนได้รับ ไม่ใช้นาฬิกาเครื่องผู้ใช้ เวลาจึงไม่เริ่มใหม่เมื่อรีเฟรช (server เก็บ `expires_at`)
- เมื่อเหลือ 0: ซ่อน QR ทันทีแล้วแสดง `verifying` ฝั่ง client จากนั้นเรียก `checkPayment` หนึ่งครั้ง และใช้ view ที่ได้

### 7.4 การอัปเดตสถานะ (`usePaymentPolling.ts`)

- ขณะ state เป็น `qr_active` หรือ `verifying` จะ `GET /orders/:id` ทุก 10 วินาที (อ่านจาก DB อย่างเดียว worker/postback เป็นผู้ยืนยัน) และหยุดเมื่อแท็บถูกซ่อน
- เรียก `POST payment-checks` เมื่อ:
  - ผู้ใช้กดปุ่ม
  - `visibilitychange` กลับมาแสดง (กลับจากแอปธนาคาร) ขณะ state เป็น `qr_active`/`verifying`/`check_failed` ไม่เกิน 1 ครั้งต่อ 5 วินาที
  - QR หมดอายุ (7.3)
- `verifying` ที่มี `retryAfterSeconds` → ตั้งเวลาเรียก `checkPayment` ตามนั้น
- อยู่ในเพดาน 12 ครั้ง/นาที/ผู้ใช้ของ API ถ้าได้ 429 ให้ปิดปุ่ม 10 วินาที
- ขอ QR: `requestQr` แล้วแทน view ทั้งก้อน กรณี 409 `MERCH_PAYMENT_VERIFYING` แสดง `verifying` + ตั้งเวลาตาม `details.retryAfterSeconds`, กรณี 409 `MERCH_PREORDER_CLOSED` แสดง `qr_expired_closed`, กรณี 503 `MERCH_PAYMENT_CHECK_FAILED` แสดง `check_failed`, กรณี 503 `MERCH_PAYMENT_UNAVAILABLE` แสดง “ระบบชำระเงินยังไม่พร้อม กรุณาลองใหม่ภายหลัง”
- กรณีเรียกแล้วเครือข่ายล้มเหลว ให้โหลด `GET order` ใหม่ และห้ามเดาว่าจ่ายหรือไม่จ่าย

## 8. Navigation, LINE OA และ Login

### 8.1 ทางเข้า

- Navbar “ของที่ระลึก” → `/souvenirs` (มีอยู่แล้วใน `navigation.ts`, `messages/*.json`) และคง Header ของร้าน (`MerchandiseHeaderTools`) ไว้
- ลิงก์ LINE OA (Rich menu/ข้อความ) ใช้ URL ตรง ไม่ใส่พารามิเตอร์พิเศษ:
  - ร้าน: `https://<โดเมน Pris>/th/souvenirs`
  - สินค้า: `https://<โดเมน Pris>/th/souvenirs/products/<productId>`
  - ประวัติออเดอร์: `https://<โดเมน Pris>/th/souvenirs/orders`
- เปิดใน LINE in-app browser ดังนั้น session ของ LINE แยกจาก Safari/Chrome (ตามข้อสังเกตใน spec LINE OA ticket) ผู้ใช้จึงอาจต้องล็อกอินใน LINE หนึ่งครั้ง

### 8.2 Login แล้วกลับหน้าเดิม

- คง `merchandiseRoutes.ts` (allowlist ของ path/query) และการผูกกับ `localizedRedirect`, `refreshRedirect`, SSO page และ login page ที่มีอยู่
- หน้าในร้านที่ต้องล็อกอิน (cart, checkout, orders, order) เมื่อไม่มี token หรือได้ 401 → `/login?redirect=<path ปัจจุบันที่ผ่าน allowlist>` และหลังล็อกอินกลับมา path เดิมพร้อม query ที่อนุญาต
- เพิ่มลงตะกร้าก่อนล็อกอิน: `merchandiseIntent.ts` เก็บ `{id, eventCode, returnPath, productId, variantId, bundleSelections, quantity}` ใน sessionStorage แล้วส่งไป login ด้วย `redirect=/souvenirs/products/:id?intentId=<id>` เมื่อกลับมา `MerchandiseIntentResume` เรียก `addCartItem` ครั้งเดียว ลบ intent แล้วแจ้ง “เพิ่มลงตะกร้าแล้ว” (ตัด `buyerId`/`expectedRevision` ออก ถ้าเพิ่มไม่สำเร็จแสดงข้อความจาก API และคงผู้ใช้ไว้ที่หน้าสินค้า)
- `reauth=merchandise` ใช้ต่อเฉพาะกรณี 401 ขณะล็อกอินอยู่ (token หมดอายุ) เพื่อไม่ให้หน้า login เด้งกลับทันที
- ล็อกเอาต์หรือเปลี่ยนบัญชี → `useMerchandiseSessionCleanup` ลบ intent, ร่างผู้รับ และ Idempotency-Key ของบัญชีอื่น

## 9. การจัดการ error

ข้อความที่แสดงใช้ `error` จาก API (ภาษาไทย) ถ้าไม่มีใช้ข้อความ fallback ตาม status (ชุดเดิมใน `merchandiseApi.ts`) code ที่ต้องทำอะไรต่อ:

| Code / status | การทำงาน |
|---|---|
| 401 | ไป login แล้วกลับหน้าเดิม (8.2) |
| 403 `MERCH_BUYER_REQUIRED` | “บัญชีนี้ใช้ซื้อสินค้าไม่ได้” |
| 404 | “ไม่พบข้อมูล” + ลิงก์กลับร้าน |
| 409 `MERCH_CART_CHANGED` | โหลด cart ใหม่ แสดงขั้นตรวจสอบอีกครั้งพร้อม “ตะกร้ามีการเปลี่ยนแปลง กรุณาตรวจสอบอีกครั้ง” |
| 422 `MERCH_CART_INVALID` / `MERCH_CART_EMPTY` | ไปหน้าตะกร้าที่แสดงรายการที่มีปัญหา |
| 409 `MERCH_PREORDER_CLOSED` | checkout: “ปิดรับพรีออเดอร์แล้ว” และปิดปุ่ม · payment: `qr_expired_closed` |
| 422 `MERCH_IDEMPOTENCY_KEY_REUSED` | ลบ key แล้วให้กดยืนยันใหม่ (สร้าง key ใหม่) |
| 422 `MERCH_ORDER_TOO_LARGE` | แสดงข้อความจาก API ที่ขั้นตรวจสอบ |
| 422 `MERCH_CART_QUANTITY_LIMIT` / `MERCH_SELECTION_INVALID` / `MERCH_PRODUCT_UNAVAILABLE` | แสดงข้อความจาก API ที่หน้าสินค้า/ตะกร้า แล้วโหลดข้อมูลใหม่ |
| 409 `MERCH_PAYMENT_VERIFYING` | `verifying` + ตั้งเวลาตรวจใหม่ |
| 503 `MERCH_PAYMENT_CHECK_FAILED` | `check_failed` |
| 503 `MERCH_PAYMENT_UNAVAILABLE` | “ระบบชำระเงินยังไม่พร้อม กรุณาลองใหม่ภายหลัง” |
| 429 | “ทำรายการถี่เกินไป กรุณารอสักครู่” + ปิดปุ่ม 10 วินาที |
| 400 `VALIDATION_ERROR` (recipient) | map `details.fieldErrors` ไปที่ช่อง แล้วกลับขั้น 1 |
| อื่นๆ / response ผิดรูป | ข้อความ fallback + ปุ่มลองใหม่ |

## 10. ลบของเก่า

- `docs/verification/merchandise/**`
- `scripts/merchandise-browser-fixture.mjs`, `merchandise-frontend-gate.mjs(+test)`, `merchandise-integrated-load.mjs`, `merchandise-lint-baseline.mjs`, `merchandise-load-browsers.mjs`, `merchandise-start-gate.mjs`
- `playwright.merchandise.final.config.ts`, script `check:merchandise-start` ใน `package.json`
- `tests/merchandise/acceptance.spec.ts`, `performance.spec.ts`, `harness.spec.ts`, `live-fixture.ts`, `storefront-visual.spec.ts`, `product-visual.spec.ts` (ทดสอบผ่าน Admin UI จริง, วัด performance หรือ capture ภาพของ contract เก่า)
- `vendor/conference-merchandise-storefront-view-1.0.0.tgz` และ dependency
- เก็บ `docs/design/merchandise/**` (mockup) และ `.gitignore`/eslint ignore ที่ยังใช้กับ Playwright (`test-results`, `playwright-report`, `playwright/.auth`) ส่วน `.merchandise-local` ให้ลบออกถ้าไม่มีอะไรใช้แล้ว

## 11. การทดสอบ

### 11.1 Unit (`npm run test:merchandise`, `tsx --test`)

- validator: DTO ถูกต้องผ่าน, Minor เป็น string/ทศนิยม/ติดลบไม่ผ่าน, enum แปลกไม่ผ่าน, `qr_active` ที่ไม่มี payload ไม่ผ่าน
- `formatMinorBaht`, เวลาไทย
- `merchandiseRecipient`: เบอร์ `+66`/ขีด/9–10 หลัก, รหัสไปรษณีย์, ค่าว่างของฟิลด์ไม่บังคับเป็น `null`
- `merchandiseCatalog`: ค้นหา/หมวด/Bundle/แบ่งหน้า
- `merchandiseSelection`: variant ที่ต้องเลือก, bundle selections เฉพาะ selectable
- `merchandiseCheckoutKey`: เขียนก่อนส่ง, storage ใช้ไม่ได้ → error, แยกตาม buyer/event, ลบเมื่อจบ
- `merchandiseIntent`, `merchandiseRoutes` (คง test เดิมที่ยังเกี่ยวข้อง)
- `merchandisePayment`: นับถอยหลังจาก anchor, view → โมเดลการแสดงผล (ทั้ง 8 state + flag)
- `merchandiseErrors`: code → action

### 11.2 Playwright (`npm run test:e2e:merchandise`)

- API mock ด้วย `page.route` จาก fixture ใน `tests/merchandise/data.ts` ที่เขียนใหม่ตาม DTO ใหม่ (type-checked กับ `src/types/merchandise.ts`)
- projects: Chromium desktop, WebKit desktop, Pixel 7 (Chromium mobile), iPhone 14 (WebKit mobile)
- ชุดทดสอบ (ปรับไฟล์เดิม):
  - `storefront`: สถานะร้านทั้ง 4, ค้นหา/หมวด/Bundle ใน URL, banner
  - `product-selection`: ไม่มีตัวเลือก / ไซซ์-สี / Bundle fixed+selectable / ซื้อไม่ได้
  - `cart` + `cart-layout`: แก้จำนวน/ตัวเลือก/ลบ, รายการ invalid ทำให้ปิดปุ่มชำระ
  - `checkout-address`: prefill, validation, ขั้นตรวจสอบใช้ cartVersion, `MERCH_CART_CHANGED`, ร้านปิดระหว่างยืนยัน
  - `order-confirmation`: Idempotency-Key ถูกเขียนก่อน POST, timeout แล้วลองใหม่ด้วย key เดิมได้ `replayed`, storage ถูกปฏิเสธแล้วไม่ส่ง, key reused
  - `payment-state`: ทั้ง 8 state + ข้อความไทยตรงตัว, QR วาดจาก payload (ถอดภาพกลับได้ payload เดิม), นับถอยหลังถึง 0 แล้วซ่อน QR, ขอ QR ใหม่, verifying + retryAfter, `visibilitychange` เรียก payment-checks, polling หยุดเมื่อ paid
  - `order-history`: แบ่งหน้า, สถานะชำระแยกจากจัดส่ง, `expired`
  - `route-login`: Navbar มี “ของที่ระลึก”, เปิดลิงก์ตรงแต่ละหน้าโดยไม่ล็อกอิน → login → กลับหน้าเดิม, intent เพิ่มลงตะกร้าครั้งเดียว, user agent LINE (iOS/Android) เปิดร้านได้
  - `legacy-regression`, `accessibility`, `storefront-accessibility`, `storefront-reflow`: คงไว้และปรับ fixture
- `npx tsc --noEmit`, `npm run lint` (ไม่เพิ่ม error ใหม่) และ `npm run build` ต้องผ่าน

### 11.3 Smoke กับ API จริงในเครื่อง

รัน conference-api `feat/merchandise-preorder` local (migration 0043 + seed + ตั้งสินค้า/ร้านเปิดเอง) แล้วเดิน flow ด้วยมือ: เลือกสินค้า → ตะกร้า → checkout → ได้ออเดอร์ ถ้ายังไม่ตั้ง env PaySolution คาดว่าจะเห็น `awaiting_qr` และ “ระบบชำระเงินยังไม่พร้อม” เมื่อขอ QR

### 11.4 User Test (เงินจริง, local + ngrok, PRIS-2026)

ทำร่วมกับ User Test ของ API (§15 ของ API spec) โดย Pris รันในเครื่องและชี้ไปที่ API ผ่าน ngrok บนอุปกรณ์ต่อไปนี้:

| อุปกรณ์ | ทางเข้า |
|---|---|
| iPhone Safari | ลิงก์ตรง และ Navbar |
| Android Chrome | ลิงก์ตรง และ Navbar |
| LINE in-app (iOS และ Android) | ลิงก์จาก LINE OA |
| คอมพิวเตอร์ (Chrome/Edge) | Navbar, สแกน QR จากจอด้วยมือถือ |

ทุกอุปกรณ์ตรวจ:
1. เปิดลิงก์ตรงโดยไม่ล็อกอิน → ล็อกอิน → กลับหน้าเดิม และ intent เพิ่มลงตะกร้าทำงาน
2. สั่งซื้อจริง → QR แสดง → บันทึกรูป (ปุ่มหรือกดค้าง) → เปิดแอปธนาคาร เลือกรูปแล้วจ่าย → กลับมาหน้าเดิม → สถานะเป็น `paid` เอง
3. รีเฟรชหรือปิดแล้วเปิดใหม่ระหว่าง `qr_active` แล้วเวลาไม่เริ่มใหม่
4. ปล่อยให้ QR หมดอายุ → `verifying` → “QR หมดอายุ” → “ขอ QR ใหม่” ได้ QR ใบใหม่ (reference ใหม่) บนออเดอร์เดิม
5. ปิดร้านขณะมี QR ที่ยังไม่หมดอายุ แล้วจ่ายได้ ส่วนออเดอร์ที่ QR หมดอายุหลังปิดร้านต้องเห็น “หมดเวลาชำระเงิน เนื่องจากปิดรับพรีออเดอร์แล้ว”
6. หน้าประวัติแสดงออเดอร์จ่ายแล้ว และข้อมูลจัดส่งหลัง Admin ใส่ tracking
7. เก็บหลักฐาน (ภาพหน้าจอที่ปิดข้อมูลส่วนตัวและไม่มี QR ที่ยังใช้ได้) ไว้ใน `docs/verification/merchandise-user-test/` เมื่อทดสอบจริง

## 12. นอกขอบเขต

- Backoffice UI และ preview (spec แยก)
- แปลข้อมูลสินค้าเป็นภาษาอังกฤษ
- ใบเสร็จ/ใบกำกับภาษี, ยกเลิก/คืนเงิน, สมุดที่อยู่, Wishlist, Coupon (ตาม API spec §16)
- การ deploy, ตั้งโดเมน และส่งข้อความ LINE OA จริง
