# Souvenir shop UI refresh, round 2 — design

Date: 2026-10-17
Branch: `feat/merchandise-preorder`
Builds on: `2026-10-16-souvenir-ui-refresh-design.md` (round 1, merged at `51df7b8`)

## Goal

Round 1 delivered the requested structure, but a review of the live pages
(desktop and a 440 px phone) found visible bugs and places where the shop
does not yet behave like an online store. This round fixes those bugs, moves
the checkout action out of the fixed bottom bar on tablet and desktop, gives
products real visual weight, and tightens the payment and order pages.

The user approved the analysis it comes from ("ยืนยันตามนั้น"), including:
a sticky right-hand action panel on tablet/desktop instead of an inline row,
and the full recommended order of work.

## Decisions

| Topic | Decision |
|---|---|
| Bottom bar on tablet/desktop | Removed at ≥768 px. Cart, address and review use two columns with a sticky action panel on the right. Phones (<768 px) keep the fixed bottom bar. |
| Panel vs. round-1 item 9 ("remove the summary card") | The panel is not the old card: no explanatory notes, only the amount(s) and the action button. |
| One component, two layouts | `CheckoutBar` keeps one DOM and one button; CSS switches it between a fixed bottom bar (<768) and a sticky panel (≥768). |
| Bar/panel label | Cart and address keep the user's wording "รวมยอดสินค้า". The review step uses "ยอดชำระเงินทั้งหมด" so it matches the payment-info table on that page. |
| Button colours | Blue `#0055ff` = choosing and adding (add to cart, selected filters, option chips). Orange `#ff5800` = moving through checkout and paying (bar/panel buttons, "ชำระเงิน" in order history, just-paid button). |
| Shipping fee | `shippingBaht` becomes any non-negative integer (type and response validator). All shipping copy is derived from it; the hard-coded "จัดส่งทั่วไทย 50 บาทต่อออเดอร์" is removed. This also makes the TEMP `one(0)` edit unnecessary. |
| Save-QR button | Stays removed (round-1 user decision). |
| Payee name on the payment page | Not shown: no payee field exists in the data. |
| Order-history thumbnails / item names | Out of scope: `OrderSummary` has no items; needs an API change first. |
| Address prefill | Out of scope: no saved-address API. |

## Breakpoints and widths

- Phone: <768 px. Tablet/desktop: ≥768 px. Wide: ≥1024 px.
- Containers: storefront max width 1200 px; product detail, cart, checkout,
  order and order-history pages 1160 px. Side gutter 20 px (16 px <360 px).
- Two-column flow pages (≥768): content `minmax(0,1fr)`, gap 24 px, panel
  280 px (768–1023) / 320 px (≥1024).

## A. Bugs (fix first)

| # | Fix |
|---|---|
| B1 | Black band under short pages: `.merchandise-route-scope` gets `background: #f4f8fc; min-height: 100svh`, so no shop page shows the dark site body. Remove per-page `min-height` hacks that only existed for this (e.g. `.merch-cart { min-height: 65vh }`). |
| B2 | Cart success messages ("บันทึกตะกร้าแล้ว", "นำสินค้าออกจากตะกร้าแล้ว") show as a `react-hot-toast` success toast (3 s), never in the orange notice box. The notice box is for errors only, and its retry / re-login button appears only for errors. |
| B3 | Review item price row stretches to full width so `x{quantity}` sits at the right edge, with or without an image (see G). |
| B4 | No doubled dividers: review sections become separate white cards (see G), so section borders are removed. |
| B5 | Product-detail spacing: one vertical rhythm (16 px between blocks, 24 px before a new section); the preorder hint no longer touches the next heading (see D). |
| B6 | Shipping copy comes only from `store.shippingBaht` via `shippingFeeLabel()` (see J). |
| B7 | Payment page shows one instruction and one time line (see H). |
| B8 | Thai QR logo renders at height 24 px, width auto (it is a wide logo). |
| B9 | Order-history pagination is hidden when `totalPages <= 1`. |

## B. Action panel / bottom bar — `CheckoutBar`

Interface stays `CheckoutBar({ totalBaht, children })`, plus two optional props:

- `label?: string` — default "รวมยอดสินค้า"; review passes "ยอดชำระเงินทั้งหมด".
- `details?: ReactNode` — extra content shown above the amount only in the
  panel layout (≥768). Review passes the payment-info table and the lock notice.

Layout:

```
Phone (<768): fixed bottom bar (unchanged from round 1)
┌──────────────────────────────────────────┐
│ รวมยอดสินค้า            [ดำเนินการสั่งซื้อ →] │
│ ฿12.00                                   │
└──────────────────────────────────────────┘

Tablet/desktop (≥768): sticky panel in the right column
┌─────────────────────────────┬──────────────┐
│ ← กลับ        คำสั่งซื้อของฉัน │              │
│ ตะกร้าสินค้า · 2 รายการ        │ ┌──────────┐ │
│ ①──②──③──④                  │ │[details] │ │  sticky, top = header height + 24 px
│ ┌─────────────────────────┐ │ │รวมยอดสินค้า│ │
│ │ cart rows (white card)  │ │ │฿12.00    │ │
│ └─────────────────────────┘ │ │[ปุ่ม  →] │ │
│                             │ └──────────┘ │
└─────────────────────────────┴──────────────┘
```

- Panel: white, radius 16 px, padding 20 px, border `1px solid #d4def0`;
  button full panel width.
- `--merch-host-bar-height` is written only when the bar is in its fixed
  phone layout; at ≥768 it is removed so pages get no extra bottom padding.
- The flow pages wrap content + panel in one grid: `.merch-flow` with
  children `.merch-flow-main` and `.merch-flow-aside` (the `CheckoutBar` root).

## C. Storefront — `StorefrontView`, `StorefrontClient`

Top to bottom:

1. **Store info banner** (`StoreInfoBanner`, new) — replaces the loose
   `merchandise-store-status` / `merchandise-store-note` paragraphs. One
   block, the page's single bold element: background `#0055ff`, white text,
   radius 20 px, padding 24 px (16 px on phones), left-aligned.
   - Title: "พรีออเดอร์ของที่ระลึก PRIS 2026" (24 px / 20 px phone, 800).
   - Date line by state: `open` + `closesAt` → "ปิดรับ {date}";
     `not_open` + `opensAt` → "เปิดรับ {date}"; otherwise the existing
     `unavailableMessage("STORE_NOT_OPEN", state)`. Dates use `formatMerchandiseTime`.
   - Then `shippingFeeLabel(store.shippingBaht)`, `shippingInfoTh` and
     `productionInfoTh`, each on its own line when present.
   - The banner carousel, when banners exist, stays above the info banner.
2. **Search + category pills** — ≥1024: one row, search `flex: 0 1 420px`,
   pills fill the rest and wrap. <1024: stacked as today.
3. **Catalog heading row** — "สินค้าทั้งหมด" / "ชุดสินค้า" on the left;
   "คำสั่งซื้อของฉัน" link on the right when logged in. The truck/shipping
   text is removed from this row. `ShopToolbar` is no longer used on the storefront.
4. **Product grid** — vertical cards at every width (delete the ≥1280
   horizontal-card override). Columns: 2 (<768), 3 (768–1279), 4 (≥1280).
   Card: square image (or placeholder, see J) → name (2 lines max) → row with
   price on the left and an add button on the right.
   - Add button: 44×44 px, round, blue outline, cart-plus icon, accessible
     name "เพิ่มลงตะกร้า" (visually hidden text) with `aria-describedby` on
     the product name, as today.
   - Per-card "พรีออเดอร์" tag removed. A card whose product is not
     purchasable shows a "ยังไม่พร้อมขาย" tag on the image and no add button.

## D. Product detail — `ProductDetail`, `product-detail.css`

≥768: two columns, gallery left (≈ 1fr) and info right (≈ 1fr, max 480 px).
<768: one column, gallery first.

```
┌───────────────────────┬────────────────────────┐
│                       │ เสื้อยืด                  │  h1
│   image 1:1 or        │ ฿6.00 / ชิ้น              │
│   placeholder         │ description             │
│                       │ สี   [ขาว] [ดำ]            │
│ [thumb][thumb]        │ ขนาด [S] [M] [L]          │
│                       │ จำนวน                    │
│                       │ [− 1 +]                  │  left-aligned under its label
│                       │ [ เพิ่มลงตะกร้า · ฿6.00 ] │  ≥768 only (phones keep the bottom bar)
│                       │ สินค้าพรีออเดอร์ · {shippingFeeLabel} │
│                       │ ▸ การผลิต                 │  <details>, closed by default
│                       │ ▸ การจัดส่ง                │
└───────────────────────┴────────────────────────┘
```

- The title moves into the info column (no longer spans above the grid).
- Gallery with no images shows the placeholder at the same 1:1 size.
- Add-to-cart (≥768) is an in-column blue button, full column width, label
  "เพิ่มลงตะกร้า · ฿{price}". `.merch-detail-bar` is hidden at ≥768.
- After a successful add (logged-in path, the intent resolves on this page),
  the button shows "เพิ่มแล้ว ✓" for 2 s and a "ดูตะกร้า" link appears next to
  it until the page is left. The toast stays.
- "กลับ": the storefront saves its canonical URL (path + allowed query, as
  produced by `merchandiseReturnPath`) to `sessionStorage` key
  `pris_merch_storefront_url` whenever it changes. The detail page's "กลับ"
  links to that value when it is present and still passes
  `merchandiseReturnPath`, otherwise to `/souvenirs`. (Client-side navigation
  does not update `document.referrer`, so the referrer cannot be used.)
  Storage access is wrapped in try/catch; failure falls back to `/souvenirs`.

## E. Cart — `CartScreen`, `CartRow`

- Flow grid from B: rows on the left inside one white card (radius 16 px,
  padding 8 px 20 px, rows divided by `#d4def0`), `CheckoutBar` on the right.
- Rows always reserve the 80 px image column (placeholder when no image).
- Price line: "฿{unit} / ชิ้น" and, when quantity > 1, " · รวม ฿{lineTotal}".
- "เปลี่ยนตัวเลือก" `<details>` becomes a text button "แก้ไขตัวเลือก" placed
  after the option text, toggling the same selector panel (`aria-expanded`).
- Notices: see B2.
- Steps indicator: see J (`CheckoutSteps`).

## F. Address step — `RecipientForm`, `CheckoutScreen`

- Flow grid from B; the form sits in a white card.
- ≥1024: paired fields on one row — ตำบล/แขวง + อำเภอ/เขต, จังหวัด + รหัสไปรษณีย์.
  Other fields full width. Required `*` behaviour unchanged.

## G. Review step — `CheckoutScreen` `ReviewBody`

- Each section (ที่อยู่จัดส่ง, รายการสินค้า, ช่องทางการชำระเงิน) is its own white
  card, stacked 16 px apart; no section borders.
- Item rows reserve the 80 px image column; the price row is
  `display:flex; justify-content:space-between; width:100%`.
- Payment method row unchanged except the logo (B8).
- ≥768: the "ข้อมูลการชำระเงิน" table and the lock notice move into the panel
  via `CheckoutBar details` (table, then the lock notice as 13 px text, then
  the amount labelled "ยอดชำระเงินทั้งหมด", then "ยืนยันคำสั่งซื้อ"). Since the
  table's last row is the same total, the panel omits the separate amount
  line when `details` is given and the table is shown.
- <768: the table stays in the content as a white card; the lock notice is
  the last content block; the bottom bar label is "ยอดชำระเงินทั้งหมด".

## H. Payment page — `OrderScreen` pay / just-paid views, `PaymentPanel`, `PaymentQr`

- `.merch-pay-card` max width 440 px, centred.
- Order inside the card:
  1. PRIS 2026 logo, 40 px tall.
  2. `<h1>` "คำสั่งซื้อ {orderNumber}" — now visible, 14 px, `#526787`.
  3. Panel title (e.g. "รอชำระเงิน") as the visual heading, 22 px, 800.
  4. Amount, 32 px.
  5. Thai QR logo (24 px tall) directly above the QR image.
  6. One time line: "ชำระภายใน {mm:ss} · หมดอายุ {HH:MM} น." (replaces the
     separate countdown and expiry lines).
  7. One instruction: "กดค้างที่รูป QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร".
  8. Auto-check note: "โอนแล้วระบบจะยืนยันให้อัตโนมัติ".
  9. "ตรวจสอบการชำระเงิน" stays a secondary button.
- The `qr_active` panel message no longer repeats the instruction; it becomes
  the auto-check note (item 8), shown once.
- Just-paid view uses the same card width and logo/heading order.

## I. Order history — `OrderHistory`

- Orders with `paymentStatus === "pending"` show an orange "ชำระเงิน" button
  (link to the order page) in place of the "ดูรายละเอียด" link; others keep it.
- Date text 13 px, `#3b4b66`.
- Pagination hidden when there is one page (B9).

## J. Shared pieces

- **`shippingFeeLabel(baht: number): string`** (`src/lib/merchandiseFormat.ts`):
  0 → "จัดส่งฟรี"; n → "ค่าจัดส่ง {formatBaht(n)} ต่อออเดอร์".
- **Shipping type/validator**: `StoreDto.shippingBaht` and
  `Amounts.shippingBaht` become `number`; `merchandiseResponse.ts` accepts a
  non-negative integer for both (replacing `one(50)`).
- **`ProductImagePlaceholder`** (new): fills its box, background `#e9eff8`,
  PRIS 2026 logo at 25 % opacity centred (max 40 % of the box width), and
  visually hidden text "ยังไม่มีรูปสินค้า". Used by product cards, the
  detail gallery, cart rows and review rows when there is no image or it
  failed to load ("โหลดรูปภาพไม่สำเร็จ" as hidden text in that case).
- **`CheckoutSteps`** (new, replaces the two duplicated `<ol>`s): max width
  640 px, steps joined by a 2 px line (blue up to the current step, `#d4def0`
  after), completed steps show a check, labels 14 px; the current step is
  bold `#0b1535`, others `#526787`. Same `aria-label="ขั้นตอนสั่งซื้อ"` and
  `aria-current="step"`.
- **Secondary text**: no text in the shop below 13 px; step labels, hints and
  dates use 14 px except the dates noted in I.
- **Loading skeletons**: storefront grid (8 card skeletons), cart (2 row
  skeletons) and order page (card skeleton) replace the plain "กำลังโหลด…"
  text; the text stays as visually hidden `role="status"` content. Skeletons
  use a static `#e9eff8` fill; a shimmer only when
  `prefers-reduced-motion: no-preference`.
- **Dev diagnostics**: when a response fails validation and
  `process.env.NODE_ENV !== "production"`, `console.warn` the endpoint and,
  when the validator knows it, the failing field path. The user-facing
  message stays "โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง".
- **Active nav item**: on souvenir pages the header's "ของที่ระลึก" link gets
  `aria-current="page"` and the blue colour `#0055ff`.

## Files

- Layout/header: `src/components/layout/Header.tsx`
- Merchandise components: `StorefrontView.tsx`, `StorefrontClient.tsx`,
  `ProductDetail.tsx`, `CartScreen.tsx`, `CartRow.tsx`, `CheckoutScreen.tsx`,
  `RecipientForm.tsx`, `CheckoutBar.tsx`, `OrderScreen.tsx`, `PaymentPanel.tsx`,
  `PaymentQr.tsx`, `PaidOrder.tsx`, `OrderHistory.tsx`; new
  `StoreInfoBanner.tsx`, `ProductImagePlaceholder.tsx`, `CheckoutSteps.tsx`,
  skeleton component(s).
- CSS: `storefront-view.css`, `storefront-host.css`, `product-detail.css`,
  `cart.css`, `checkout.css`, `order.css`, `history.css`.
- Lib/types: `src/lib/merchandiseFormat.ts`, `src/lib/merchandiseResponse.ts`,
  `src/lib/merchandisePayment.ts` (qr_active message), `src/types/merchandise.ts`.

## Error handling

No new failure paths. Error notices keep their placement in the page body;
success messages move to toasts. Validation failures now also leave a dev
console warning. Skeletons never replace an error state: an error shows
the existing message and retry button.

## Testing

- Unit: `shippingFeeLabel` (0, 50, 120); response validator accepts 0 and 50
  and rejects −1 and 1.5.
- Playwright (`playwright.merchandise.config.ts`), updating round-1 specs
  where the UI moved:
  - No dark band: at 1440 and 440 px, on product detail with short content,
    the page background below `main` is `#f4f8fc`.
  - Panel vs bar: at 1024 px, cart/address/review show `.merch-checkout-bar`
    inside the right column, not fixed (computed `position` is `sticky`) and
    `--merch-host-bar-height` is unset; at 390 px it is fixed at the bottom.
  - Review at 1024 px: the payment-info table and lock notice are inside the
    panel; at 390 px they are in the content and the bar label is
    "ยอดชำระเงินทั้งหมด".
  - Cart remove: shows a success toast and no `.merch-cart-notice`.
  - Quantity 3 shows "รวม ฿{3×unit}" in the row.
  - Review `x{qty}` right edge within 2 px of the row's right edge, with and
    without an image.
  - Storefront: info banner shows the close date and the shipping label from
    `shippingBaht` (0 → "จัดส่งฟรี", 50 → "ค่าจัดส่ง ฿50.00 ต่อออเดอร์"); no
    "จัดส่งทั่วไทย" text anywhere; cards are vertical at 1440 px (image above
    name); add button 44×44 with name "เพิ่มลงตะกร้า".
  - Product detail at 1024 px: title is inside the info column, the
    in-column add button is visible and `.merch-detail-bar` is hidden;
    "เพิ่มแล้ว ✓" appears after a logged-in add; "กลับ" from a filtered
    storefront returns to the same filtered URL.
  - Payment page: card width ≤ 440 px; visible "คำสั่งซื้อ {n}"; exactly one
    instruction line and one time line.
  - Order history: a pending order shows "ชำระเงิน" linking to its order
    page; one page of results shows no pagination.
  - Checkout steps: one shared component on cart and checkout, current step
    `aria-current="step"`.
- `npm test`, `npx tsc --noEmit`, eslint on touched files; full Playwright
  matrix before merge.
