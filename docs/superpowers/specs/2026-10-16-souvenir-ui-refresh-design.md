# Souvenir shop UI refresh — design

Date: 2026-10-16
Branch: `feat/merchandise-preorder`
Builds on: `2026-10-16-merchandise-frontend-design.md`

## Goal

Make the souvenir shop (`/souvenirs/*`) feel like part of the PRIS 2026 site
and make the checkout flow simpler to read: one shared site header, no footer,
no storefront bottom bar, a single-select filter, a balanced quantity stepper,
a fixed bottom bar with "total left / action right" on every checkout step,
a compact review step, and a QR-only payment screen that sends the buyer back
to their order list after payment.

## Decisions taken with the user

| Question | Decision |
|---|---|
| Where does the cart button live once the shop header is removed? | A cart icon with count is added to the normal site header, only on souvenir pages, at every breakpoint. |
| Does the QR-only view and 10 s redirect apply to every order page? | Only during payment. A paid order opened from history keeps today's detail view with no redirect. |
| Where is the remove (trash) button in a cart row? | Row 2, right of the quantity stepper. |
| Bottom bar button labels | Each step keeps its own label: ดำเนินการสั่งซื้อ (cart), ตรวจสอบคำสั่งซื้อ (address), ยืนยันคำสั่งซื้อ (review). |
| Payment info rows | รวมคำสั่งซื้อ = `subtotalBaht`, ค่าจัดส่ง = `shippingBaht`, ยอดชำระเงินทั้งหมด = `totalBaht`. |
| Thai QR logo | `C:\Users\JaoNo\Downloads\Thai_QR_Logo.svg.webp` (the `.svg` named by the user does not exist), copied to `public/assets/Img/payment/thai-qr.webp`. |

## Scope

In scope: header, footer, storefront, product detail stepper, cart, checkout
address step, checkout review step, order/payment page.
Out of scope: API changes, order history list layout, product detail add-to-cart
bar (unchanged), English translations (the shop's strings stay hard-coded Thai
as today).

## A. Shared layout (items 1, 2, 6, 7)

### Header — `src/components/layout/Header.tsx`

- Remove the shop-only branch: the `merchandise-page-header` class,
  `merchandise-header-logo`, `MerchandiseHeaderTools`, and the `isShop`
  conditions that hide the normal locale button, profile/login buttons and
  mobile `SheetTrigger`. The shop then renders exactly the desktop, tablet and
  mobile header every other page uses.
- Souvenir pages have a light background, so `isMerchandisePath(pathname)`
  joins the `useDarkText` condition (dark logo, dark nav text).
- Keep the merchandise-aware `switchLocale` branch (it preserves the shop
  return path) and `useMerchandiseSessionCleanup`.
- Add a cart icon button with badge, rendered only when `isShop`:
  - desktop (`xl`): in the right-hand tool group, before the locale button;
  - mobile/tablet: in the `xl:hidden` group, before the locale button.
  - Reuses the count logic from `MerchandiseHeaderTools` (logged out → `0`,
    loading → `—`, `>99` → `99+`) and its click target
    (`/souvenirs/cart`, or `merchandiseLoginPath("/souvenirs/cart")` when
    logged out). Styled to match the header's existing icon buttons.
  - `MerchandiseHeaderTools` becomes a `MerchandiseCartButton` component;
    `StoreHeaderTools` and the `.merch-header-tools` CSS are deleted if nothing
    else uses them.

### Footer — `src/components/layout/Footer.tsx`

Return `null` when `isMerchandisePath(pathname)`.

### "คำสั่งซื้อของฉัน" (items 6 and 7)

- Delete the `.merchandise-history-link` strip at the bottom of the storefront
  (the item 6 bug: a separately-backgrounded block that sits between content
  and footer) and its CSS.
- Add a page toolbar row at the top of the storefront content and the cart page:
  left side is empty (storefront) or the existing "กลับ" link (cart); right
  side is a "คำสั่งซื้อของฉัน" link to `/souvenirs/orders`, shown only when
  logged in. Remove the old "คำสั่งซื้อของฉัน" link under the cart grid.

## B. Storefront (items 3, 4) — `StorefrontView.tsx`, `StorefrontClient.tsx`

- Remove `.merch-bottom-bar`, the `primaryLabel`, `primaryDisabled` and
  `onPrimary` props, `canBuy`, and both `--merch-bar-height` /
  `--merch-host-bar-height` measurements and the bottom padding that reserved
  space for the bar.
- Add-to-cart while logged out keeps the existing behaviour: save a purchase
  intent, go to `/login?redirect=<storefront path with intentId>`, and
  `MerchandiseIntentResume` adds the item on return.
- Filters become single-select:
  - `onCategory(id)` → `{ categoryId: id, kind: null }`
  - `onKind("bundle")` → `{ kind: "bundle", categoryId: null }`
  - pressing the active pill (category or ชุดสินค้า) → back to ทั้งหมด
    (`{ categoryId: null, kind: null }`).
  - `aria-pressed` is true on exactly one pill at all times.
- A URL that carries both `categoryId` and `kind` (old bookmark) is treated as
  `kind=bundle` only, and the URL is rewritten without `categoryId`.

## C. Product detail stepper (item 5) — `product-detail.css`

`.merch-detail-quantity > div` becomes a 3-column grid
`44px 56px 44px`, height 44 px, one 1 px border with 12 px radius, buttons
centred with equal padding, value centred. The disabled `−` keeps the same box
size (only colour changes) so the control does not look lopsided. The cart row
stepper (`.merch-cart-stepper`) uses the same metrics.

## D. Cart (items 8, 9, 10) — `CartScreen.tsx`, `CartRow.tsx`, `cart.css`

- Remove `<aside className="merch-cart-summary">` and its explanatory notes;
  `.merch-cart-grid` becomes a single column.
- Cart row layout (grid: image column + detail column):

  ```
  [image]  ชื่อสินค้า
           ตัวเลือก ................. [ − 1 + ] 🗑
           ฿ราคา / ชิ้น
  ```

  Bundle component list, price-change notice, issue messages, "บันทึกจำนวน",
  "เปลี่ยนตัวเลือก" and "ดูตัวเลือกสินค้า" stay, placed below row 3.
  "รวมรายการ" line is removed (the bar shows the total).
  On widths < 360 px row 2 wraps: option text on its own line, stepper + trash
  below it, right-aligned.
- Bottom bar via the new `CheckoutBar` (section H): left
  "รวมยอดสินค้า ฿{totalBaht}" (or "—" when `amounts` is null), right button
  "ดำเนินการสั่งซื้อ" (busy label unchanged: "กำลังตรวจสอบตะกร้า").

## E. Address step (item 11) — `RecipientForm.tsx`, `CheckoutScreen.tsx`

- Every non-optional field label gets `<span className="merch-required"
  aria-hidden="true">*</span>` in red (`#dc2626`); the input already has
  `required`, so screen readers announce it. Optional fields keep
  "(ไม่บังคับ)".
- Remove `CheckoutSummary`.
- `CheckoutBar`: left total from `contextCart.data.amounts`, right
  "ตรวจสอบคำสั่งซื้อ" (submits `merch-recipient-form`).

## F. Review step (item 12) — `CheckoutScreen.tsx` `ReviewBody`

Order of sections:

1. **ที่อยู่จัดส่ง** — one paragraph, parts joined by a single space:
   `fullName phone [company] addressLine subdistrict district province
   postalCode ประเทศไทย`; delivery note on its own line below if present.
2. **รายการสินค้า**:

   ```
   [image]  ชื่อสินค้า
            ตัวเลือก
            ฿ราคาต่อหน่วย ......................... x{quantity}
   ```

   Bundles show their component list under ตัวเลือก.
3. **ช่องทางการชำระเงิน** — one bordered option row:
   `[Thai QR logo 32px]  QR พร้อมเพย์ .......... (●)`
   A native `<input type="radio" name="payment-method" checked readOnly>` with
   a `<label>`, so it is selected, focusable and announced as a radio group of
   one. No state is sent to the API (PromptPay is the only method).
4. **ข้อมูลการชำระเงิน** (replaces the removed summary card):

   | รวมคำสั่งซื้อ | `subtotalBaht` |
   |---|---|
   | ค่าจัดส่ง | `shippingBaht` |
   | **ยอดชำระเงินทั้งหมด** | **`totalBaht`** |

5. The existing lock notice ("เมื่อยืนยันคำสั่งซื้อแล้ว …") stays.

Removed: การผลิต and การจัดส่ง sections, the "ชำระเงินด้วย" section,
`CheckoutSummary`.

`CheckoutBar`: left total, right "ยืนยันคำสั่งซื้อ" (busy label unchanged: "กำลังยืนยันคำสั่งซื้อ";
uncertain state "ลองอีกครั้ง").

## G. Payment page (item 13) — `OrderScreen.tsx`, `PaymentPanel.tsx`, `PaymentQr.tsx`, `PaidOrder.tsx`

`OrderWorkspace` picks one of three views:

| Condition | View |
|---|---|
| Not paid | **Pay view**: no back link, no visible order heading (a visually hidden `<h1>` "คำสั่งซื้อ {orderNumber}" stays for screen readers), no items/recipient/amount sections. A centred card: PRIS 2026 logo (`/assets/Img/logo/Logo-Final .png`, dark, ~48 px tall), then the existing `PaymentPanel` (title e.g. "รอชำระเงิน", amount, QR, countdown, expiry, check/request button, notices). |
| Became paid while this page was open (first seen unpaid, polling then reports paid) | **Just-paid view**: same card, success icon + "ชำระเงินสำเร็จ", a primary button "ไปหน้ารายการคำสั่งซื้อ" linking to `/souvenirs/orders`, and the text "จะพาไปหน้ารายการคำสั่งซื้อใน {n} วินาที". A 10 s countdown then calls `router.replace("/souvenirs/orders")`. |
| Already paid when the page loaded (e.g. opened from history) | **Detail view**: today's layout unchanged — back link "กลับหน้าประวัติ", items, amounts, recipient, `PaidOrder` (delivery/tracking). |

Details:

- "Became paid" is tracked with a ref set from the first rendered order
  (`initialPaid`); the just-paid view shows when `!initialPaid && paid`.
- Countdown: a `useEffect` interval ticking once per second from 10; it is
  cleared on unmount, and clicking the button navigates immediately. The
  number lives in an `aria-live="polite"` region updated only at 10, 5 and 0
  to avoid announcing every second.
- `PaymentQr`: remove the "บันทึกภาพ QR" download link; keep a shorter hint
  "กดค้างที่รูป QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร". The `qr_active` panel message in `merchandisePayment.ts` drops its "บันทึกภาพ QR" wording: "ใช้แอปธนาคารสแกน QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร".
- The "กลับหน้าประวัติ" link is removed from the pay and just-paid views only.

## H. Shared `CheckoutBar` component

New `src/components/merchandise/CheckoutBar.tsx`:

```tsx
<CheckoutBar
  totalBaht={number | null}
  label="รวมยอดสินค้า"
  action={<button …>…</button>}
/>
```

- Fixed to the bottom, white, top border, safe-area padding; inner row capped
  to the page content width (same max width as `.merch-cart`).
- Left: label (small, muted) above / beside the amount (bold, brand blue).
  Right: the action button (orange `#ff5a00` as today, auto width, min height
  48 px, arrow icon).
- Measures its own height into `--merch-host-bar-height` (the logic now
  duplicated in `CartScreen` and `CheckoutScreen`) so page content is not
  covered.
- Mobile: same single row; amount shrinks to 18 px; button text does not wrap.

## Files touched

- `src/components/layout/Header.tsx`, `Footer.tsx`
- `src/components/merchandise/`: `StorefrontView.tsx`, `StorefrontClient.tsx`,
  `CartScreen.tsx`, `CartRow.tsx`, `CheckoutScreen.tsx`, `RecipientForm.tsx`,
  `OrderScreen.tsx`, `PaymentQr.tsx`, `MerchandiseHeaderTools.tsx` (→ cart
  button), `StoreHeaderTools.tsx` (removed if unused), new `CheckoutBar.tsx`
- CSS: `storefront-view.css`, `storefront-host.css`, `product-detail.css`,
  `cart.css`, `checkout.css`, `order.css`
- `public/assets/Img/payment/thai-qr.webp` (new)

## Error handling

No new failure paths. Existing notices (cart write errors, 401 re-login links,
uncertain checkout, payment polling notices) keep their current placement
inside the page body; the bottom bar never hides them because content is
padded by `--merch-host-bar-height`. The countdown redirect only runs on the
just-paid view, so a failed or pending payment never navigates away.

## Testing

- Playwright suite `npm run test:e2e:merchandise` (fake API):
  - update specs asserting removed UI: `storefront.spec.ts`,
    `storefront-accessibility.spec.ts`, `storefront-reflow.spec.ts`,
    `cart.spec.ts`, `payment-state.spec.ts`, `accessibility.spec.ts`;
  - new assertions: footer absent on `/souvenirs/*`; normal header (login /
    profile button) present with cart badge; selecting ชุดสินค้า clears the
    category and vice versa (exactly one `aria-pressed="true"`); logged-out
    add-to-cart lands on `/login?redirect=…` and returns with the item added;
    required `*` on each required recipient field; review shows the PromptPay
    radio checked and the three payment-info rows; unpaid order shows QR card
    without back link or save button; paid transition shows the countdown and
    redirects to `/souvenirs/orders` after 10 s (fake clock); a pre-paid order
    shows the detail view and does not redirect.
- `npm test`, `npm run lint`, `npx tsc --noEmit`.
- Manual check in the browser at 375, 768 and 1440 px for header, bar and
  stepper alignment.
