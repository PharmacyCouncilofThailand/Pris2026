# Souvenir UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `/souvenirs/*` shop so it uses the site header with no footer, simplifies the storefront, and gives every checkout step one "total left / action right" bottom bar, a compact review step and a QR-only payment screen that returns the buyer to their orders.

**Architecture:** Presentation-only change in the Next.js app (`Pris2026`). Two small pure helpers (`nextCatalogFilter`, `formatRecipientLine`) carry the logic that can be unit-tested; one shared `CheckoutBar` component replaces three bottom bars; one hook (`useRedirectCountdown`) drives the post-payment redirect. No API or type changes.

**Tech Stack:** Next.js (App Router, `next-intl` routing), React, plain CSS files under `src/components/merchandise/`, `node:test` via `tsx` for unit tests, Playwright (`playwright.merchandise.config.ts`, fake API in `tests/merchandise/fakeApi.ts`) for UI tests.

**Spec:** `docs/superpowers/specs/2026-10-16-souvenir-ui-refresh-design.md`

## Global Constraints

- Work on branch `feat/merchandise-preorder` in `Pris2026/`. Four files already carry uncommitted edits (`CartScreen.tsx`, `CheckoutScreen.tsx`, `StorefrontView.tsx`, `src/lib/merchandiseResponse.ts`); build on them, never revert them, and stage files by name (never `git add -A`).
- All shop copy stays hard-coded Thai, exactly as written in the spec.
- Bottom bar labels: cart "ดำเนินการสั่งซื้อ", address "ตรวจสอบคำสั่งซื้อ", review "ยืนยันคำสั่งซื้อ"; existing busy/uncertain labels are kept unchanged.
- Bar left label: "รวมยอดสินค้า"; amount is `formatBaht(totalBaht)` or "—" when amounts are null.
- Payment info rows: "รวมคำสั่งซื้อ" = `subtotalBaht`, "ค่าจัดส่ง" = `shippingBaht`, "ยอดชำระเงินทั้งหมด" = `totalBaht`.
- Required marker: red `#dc2626` `*` inside the label, `aria-hidden="true"`, so accessible label names do not change.
- Redirect target after payment: `/souvenirs/orders`, after 10 seconds.
- Interactive targets stay ≥ 44 × 44 px; no horizontal scroll at 320–1920 px.
- Pay view keeps a visually hidden `<h1>` "คำสั่งซื้อ {orderNumber}" (page needs a heading; existing tests rely on it). Nothing else about the order is shown in that view.
- Unit tests: `npx tsx --test <file>`. UI tests: `npx playwright test -c playwright.merchandise.config.ts <spec> --project=chromium` (the suite starts its own dev server on :3102).

## Review Focus

1. Old bookmark URL carrying both `categoryId` and `kind=bundle` — expected to show bundles only and drop `categoryId` from the URL (Task 2 test `legacy URL with category and bundle keeps bundle only`).
2. The red `*` must not change label accessible names — `fillAddress` uses `getByLabel(..., { exact: true })` (Task 5 test `required fields show a red asterisk without changing their names`).
3. A paid order opened from history must never auto-redirect (Task 7 test `an order already paid on load shows details and never redirects`).
4. Payment moving to a non-paid state (verifying / expired) must not start the countdown (Task 7 test `verifying after QR shows no countdown`).
5. The fixed bar must not cover the last row or notice on a 375 px phone (Task 4 test `last cart row stays above the bar on a phone`, Task 6 test `review lock notice stays above the bar on a phone`).

---

### Task 1: Site header and no footer on shop pages

**Files:**
- Modify: `src/components/layout/Header.tsx` (remove `isShop` shop-header branches; add cart button)
- Modify: `src/components/layout/Footer.tsx`
- Create: `src/components/merchandise/MerchandiseCartButton.tsx` (replaces `MerchandiseHeaderTools.tsx`)
- Delete: `src/components/merchandise/MerchandiseHeaderTools.tsx`, `src/components/merchandise/StoreHeaderTools.tsx`, `.merch-header-tools` / `.merch-cart-tool` / `.merch-tool-divider` / `.merchandise-page-header` / `.merchandise-header-logo` rules in `storefront-view.css` and `storefront-host.css`
- Test: `tests/merchandise/shell.spec.ts` (new); update `tests/merchandise/accessibility.spec.ts`, `tests/merchandise/storefront-accessibility.spec.ts`

**Interfaces:**
- Produces: `MerchandiseCartButton({ className }: { className?: string }): JSX.Element` — a `<button type="button" className={"merch-header-cart " + className}>` with cart icon, badge (`0` logged out, `—` loading, `99+` over 99) and `aria-label` `ตะกร้า {n} รายการ` (`ตะกร้า กำลังตรวจสอบ รายการ` while loading); click → `/souvenirs/cart`, or `merchandiseLoginPath("/souvenirs/cart")` when there is no token. Must render inside `MerchandiseProvider` (it is, via `MerchandiseRouteScope`).

- [ ] **Step 1: Write the failing tests** in `tests/merchandise/shell.spec.ts`

```ts
test("souvenir pages use the site header and show no footer", async ({ page, fake }) => {
  fake.products = [makeSingle()];
  for (const path of ["/th/souvenirs", `/th/souvenirs/products/${fake.products[0].id}`]) {
    await page.goto(path);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator(".merch-header-tools")).toHaveCount(0);
    await expect(page.locator("header .merch-header-cart")).toBeVisible();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("link", { name: /login|เข้าสู่ระบบ/i }).first()).toBeVisible();
});
test("logged-out cart button goes to login and back to the cart", async ({ page, fake }) => {
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  await page.locator("header .merch-header-cart").click();
  await expect(page).toHaveURL(/\/th\/login\?redirect=%2Fsouvenirs%2Fcart$/);
});
test("logged-in cart badge shows the cart units", async ({ page, fake }) => {
  const p = makeSingle(); fake.products = [p];
  fake.seedLine({ productId: p.id, variantId: p.variants[0].id, bundleSelections: [], quantity: 3 });
  await login(page);
  await page.goto("/th/souvenirs");
  await expect(page.locator("header .merch-header-cart")).toHaveAccessibleName("ตะกร้า 3 รายการ");
});
```

Also run it at `{ width: 375, height: 812 }` inside the first test: cart button visible next to the normal mobile menu trigger (`getByRole("button", { name: "Toggle mobile menu" })`).

- [ ] **Step 2: Run** `npx playwright test -c playwright.merchandise.config.ts shell.spec.ts --project=chromium` — Expected: FAIL (footer present, `.merch-header-tools` present).

- [ ] **Step 3: Implement**
  - `Header.tsx`: delete the `"merchandise-page-header"` class branch, the `merchandise-header-logo` class, the `{isShop && <MerchandiseHeaderTools …/>}` block, every `!isShop &&` guard on the desktop tool group / mobile locale button / `SheetTrigger`, the `isShop ? "contents" : …` class switch and the `onClick` close-on-link handler that only applied to `isShop`. Add `isMerchandisePath(pathname)` to the `useDarkText` condition. Render `<MerchandiseCartButton />` when `isShop`: first child of the desktop right group (`hidden xl:flex …`) and first child of the `xl:hidden` group. Style it like the locale button (h-10 rounded-full, dark text; badge: absolute, orange `#ff5800`, white 11 px text).
  - `Footer.tsx`: return `null` when `isMerchandisePath(pathname)`.
  - Delete the two old components and their CSS.

- [ ] **Step 4: Update the old geometry/menu tests** — in `accessibility.spec.ts` and `storefront-accessibility.spec.ts` replace `.merch-header-tools` with `header .merch-header-cart`, replace the "เปิดเมนู" button with `getByRole("button", { name: "Toggle mobile menu" })` (only below 1280 px), and remove every assertion on `footer a`. Bottom-bar assertions in these files are handled in Task 2 — leave them.

- [ ] **Step 5: Run** `shell.spec.ts accessibility.spec.ts storefront-accessibility.spec.ts --project=chromium` — Expected: shell tests PASS; remaining failures only on `.merch-bottom-bar` lines (fixed in Task 2). Then `npx tsc --noEmit` and `npm run lint` — Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Footer.tsx src/components/merchandise/MerchandiseCartButton.tsx src/components/merchandise/MerchandiseHeaderTools.tsx src/components/merchandise/StoreHeaderTools.tsx src/components/merchandise/storefront-view.css src/components/merchandise/storefront-host.css tests/merchandise/shell.spec.ts tests/merchandise/accessibility.spec.ts tests/merchandise/storefront-accessibility.spec.ts
git commit -m "feat(merchandise): use the site header with a cart button and hide the footer on shop pages"
```

---

### Task 2: Storefront — no bottom bar, single-select filter, "คำสั่งซื้อของฉัน" top right

**Files:**
- Modify: `src/lib/merchandiseCatalog.ts`, `src/lib/merchandiseCatalog.test.ts`
- Modify: `src/components/merchandise/StorefrontView.tsx`, `StorefrontClient.tsx`, `storefront-view.css`, `storefront-host.css`
- Create: `src/components/merchandise/ShopToolbar.tsx`
- Test: `tests/merchandise/storefront.spec.ts`, `storefront-accessibility.spec.ts`, `storefront-reflow.spec.ts`, `accessibility.spec.ts`

**Interfaces:**
- Produces: `nextCatalogFilter(current: { categoryId: string | null; kind: "bundle" | null }, pressed: "all" | "bundle" | { categoryId: string }): { categoryId: string | null; kind: "bundle" | null }` in `merchandiseCatalog.ts`.
- Produces: `ShopToolbar({ start }: { start?: ReactNode }): JSX.Element` — `<div className="merch-shop-toolbar">` with `start` on the left and, when `useMerchandise().token` is set, `<Link href="/souvenirs/orders" className="merch-my-orders">คำสั่งซื้อของฉัน</Link>` on the right. Used again in Task 4.
- `StorefrontViewProps` loses `primaryLabel`, `primaryDisabled`, `onPrimary`; `onCategory`/`onKind` are replaced by `onFilter(pressed: "all" | "bundle" | { categoryId: string }): void`.

- [ ] **Step 1: Write failing unit tests** in `merchandiseCatalog.test.ts`

```ts
test("picking a category clears bundle", () =>
  assert.deepEqual(nextCatalogFilter({ categoryId: null, kind: "bundle" }, { categoryId: "c1" }), { categoryId: "c1", kind: null }));
test("picking bundle clears the category", () =>
  assert.deepEqual(nextCatalogFilter({ categoryId: "c1", kind: null }, "bundle"), { categoryId: null, kind: "bundle" }));
test("pressing the active pill returns to all", () => {
  assert.deepEqual(nextCatalogFilter({ categoryId: "c1", kind: null }, { categoryId: "c1" }), { categoryId: null, kind: null });
  assert.deepEqual(nextCatalogFilter({ categoryId: null, kind: "bundle" }, "bundle"), { categoryId: null, kind: null });
});
test("all clears both", () =>
  assert.deepEqual(nextCatalogFilter({ categoryId: "c1", kind: null }, "all"), { categoryId: null, kind: null }));
```

- [ ] **Step 2: Run** `npx tsx --test src/lib/merchandiseCatalog.test.ts` — Expected: FAIL (`nextCatalogFilter` is not exported).

- [ ] **Step 3: Implement `nextCatalogFilter`**; run the unit test — Expected: PASS.

- [ ] **Step 4: Write failing UI tests** in `storefront.spec.ts`. Replace the body of "category and bundle filters live in the URL and survive reload" so that after clicking "เครื่องแต่งกาย" then "ชุดสินค้า" the URL has `kind=bundle` and no `categoryId`, and `page.locator('.merch-categories [aria-pressed="true"]')` has count 1 after every click. Add:

```ts
test("legacy URL with category and bundle keeps bundle only", async ({ page, fake }) => {
  const cat = uid(900);
  fake.store = makeStore({ categories: [{ id: cat, nameTh: "เครื่องแต่งกาย", sortOrder: 1 }] });
  fake.products = [makeSingle({ id: uid(1), categoryId: cat }), makeBundle({ id: uid(3) })];
  await page.goto(`/th/souvenirs?categoryId=${cat}&kind=bundle`);
  await expect(page).not.toHaveURL(/categoryId=/);
  await expect(page.locator(".merch-product")).toHaveCount(1);
  await expect(page.locator('.merch-categories [aria-pressed="true"]')).toHaveText("ชุดสินค้า");
});
test("storefront has no bottom bar; my orders link sits top right only when logged in", async ({ page, fake }) => {
  fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-bottom-bar")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "คำสั่งซื้อของฉัน" })).toHaveCount(0);
  await login(page);
  await page.goto("/th/souvenirs");
  const link = page.getByRole("link", { name: "คำสั่งซื้อของฉัน" });
  const box = (await link.boundingBox())!, banner = (await page.locator(".merch-search").boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(banner.y);
  expect(box.x + box.width).toBeGreaterThan(page.viewportSize()!.width / 2);
});
```

In the store-state loop test remove `expect(page.locator(".merch-primary")).toBeDisabled()`. In `storefront-accessibility.spec.ts`, `storefront-reflow.spec.ts` and `accessibility.spec.ts` drop the `.merch-bottom-bar` / "เข้าสู่ระบบเพื่อสั่งซื้อ" / `.merch-primary` assertions; keep the "last add button reachable and focused" checks.

- [ ] **Step 5: Run** `storefront.spec.ts --project=chromium` — Expected: FAIL on the new tests.

- [ ] **Step 6: Implement**
  - `StorefrontView`: delete the bottom-bar markup, its `ResizeObserver` and `--merch-bar-height`; the four pills call `onFilter("all" | {categoryId} | "bundle")`; `aria-pressed` = (`activeKind === "bundle"`) for ชุดสินค้า, (`activeKind !== "bundle" && activeCategory === c.id`) for a category, both-empty for ทั้งหมด. Render `<ShopToolbar />` as the first child of `.merch-store-content`. The "ดูสินค้าทั้งหมด" reset button calls `onQuery("")` then `onFilter("all")`.
  - `StorefrontClient`: delete `canBuy`, the bar `useLayoutEffect`, the `.merchandise-history-link` block and its import of `Link` if unused; `onFilter` → `withDraft(nextCatalogFilter({categoryId, kind}, pressed))` mapped to URL params (`null` deletes). In `filters`, when both `categoryId` and `kind` are present treat `categoryId` as absent, and the canonical-URL effect `router.replace`s without `categoryId`.
  - CSS: delete `.merch-bottom-bar`, `.merchandise-history-link` rules and the bar's bottom padding; add `.merch-shop-toolbar { display:flex; justify-content:space-between; align-items:center; min-height:44px }` and `.merch-my-orders` (blue `#0055ff`, underline offset 4px, min-height 44px, inline-flex).

- [ ] **Step 7: Run** `npx tsx --test src/lib/merchandiseCatalog.test.ts` and `storefront.spec.ts storefront-accessibility.spec.ts storefront-reflow.spec.ts accessibility.spec.ts route-login.spec.ts --project=chromium` — Expected: PASS (route-login proves logged-out add-to-cart still goes to login and comes back with the item).

- [ ] **Step 8: Commit**

```bash
git add src/lib/merchandiseCatalog.ts src/lib/merchandiseCatalog.test.ts src/components/merchandise/StorefrontView.tsx src/components/merchandise/StorefrontClient.tsx src/components/merchandise/ShopToolbar.tsx src/components/merchandise/storefront-view.css src/components/merchandise/storefront-host.css tests/merchandise/storefront.spec.ts tests/merchandise/storefront-accessibility.spec.ts tests/merchandise/storefront-reflow.spec.ts tests/merchandise/accessibility.spec.ts
git commit -m "feat(merchandise): single-select storefront filter, no bottom bar, my-orders link top right"
```

---

### Task 3: Balanced quantity stepper on product detail

**Files:**
- Modify: `src/components/merchandise/product-detail.css` (`.merch-detail-quantity …`)
- Test: `tests/merchandise/product-selection.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
test("quantity stepper is three equal-height cells with the value centred", async ({ page, fake }) => {
  const p = makeSingle(); fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  const minus = (await page.getByRole("button", { name: "ลดจำนวน" }).boundingBox())!;
  const plus = (await page.getByRole("button", { name: "เพิ่มจำนวน" }).boundingBox())!;
  const box = (await page.locator(".merch-detail-quantity > div").boundingBox())!;
  expect(minus.width).toBe(44); expect(plus.width).toBe(44);
  expect(minus.height).toBe(plus.height);
  expect(Math.abs((minus.x - box.x) - (box.x + box.width - plus.x - plus.width))).toBeLessThan(1);
});
```

- [ ] **Step 2: Run** `product-selection.spec.ts --project=chromium -g "stepper"` — Expected: FAIL (side gaps differ).

- [ ] **Step 3: Implement** — `.merch-detail-quantity > div { display:grid; grid-template-columns:44px 56px 44px; align-items:center; height:44px; overflow:hidden }`, buttons `width:44px; height:44px; display:grid; place-items:center`, input `width:56px; text-align:center`, disabled button keeps size and only lowers opacity.

- [ ] **Step 4: Run** the same command — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/product-detail.css tests/merchandise/product-selection.spec.ts
git commit -m "fix(merchandise): balance the product quantity stepper"
```

---

### Task 4: Shared CheckoutBar and the cart page redesign

**Files:**
- Create: `src/components/merchandise/CheckoutBar.tsx`
- Modify: `src/components/merchandise/CartScreen.tsx`, `CartRow.tsx`, `cart.css`
- Test: `tests/merchandise/cart.spec.ts`, `tests/merchandise/cart-layout.spec.ts`

**Interfaces:**
- Consumes: `ShopToolbar` (Task 2).
- Produces: `CheckoutBar({ totalBaht, children }: { totalBaht: number | null; children: ReactNode }): JSX.Element` — `<div className="merch-checkout-bar">` containing `<p className="merch-checkout-bar-total"><span>รวมยอดสินค้า</span> <strong>{formatBaht(totalBaht) | "—"}</strong></p>` and `children` (the action button). It owns the `ResizeObserver` that writes `--merch-host-bar-height` on `document.documentElement` and removes it on unmount. Inner row max-width 1160px. Button styles live on `.merch-checkout-bar > button` (orange `#ff5800`, white, min-height 48px, rounded-full, auto width, `white-space:nowrap`, disabled grey as today's `.merch-cart-bar > button:disabled`). Used again in Tasks 5 and 6.

- [ ] **Step 1: Write the failing tests** in `cart-layout.spec.ts`

```ts
test("cart row reads image+name / option+stepper+trash / price, and the bar shows total left and action right", async ({ page, fake }) => {
  const p = makeOptionsProduct({ nameTh: "เสื้อยืด Pris" }); fake.products = [p];
  fake.seedLine({ productId: p.id, variantId: p.variants[0].id, bundleSelections: [], quantity: 1 });
  await login(page); await page.goto("/th/souvenirs/cart");
  const name = (await page.getByRole("heading", { name: "เสื้อยืด Pris" }).boundingBox())!;
  const option = (await page.locator(".merch-cart-row-option").boundingBox())!;
  const stepper = (await page.locator(".merch-cart-stepper").boundingBox())!;
  const trash = (await page.getByRole("button", { name: "ลบ เสื้อยืด Pris" }).boundingBox())!;
  const price = (await page.locator(".merch-cart-unit-price").boundingBox())!;
  expect(option.y).toBeGreaterThan(name.y);
  expect(Math.abs(option.y + option.height / 2 - (stepper.y + stepper.height / 2))).toBeLessThan(12);
  expect(trash.x).toBeGreaterThan(stepper.x + stepper.width - 1);
  expect(price.y).toBeGreaterThanOrEqual(stepper.y + stepper.height - 1);
  await expect(page.getByRole("complementary", { name: "สรุปคำสั่งซื้อ" })).toHaveCount(0);
  await expect(page.locator(".merch-checkout-bar-total")).toHaveText(/รวมยอดสินค้า\s*฿\d/);
  const total = (await page.locator(".merch-checkout-bar-total").boundingBox())!;
  const action = (await page.getByRole("button", { name: /^ดำเนินการสั่งซื้อ/ }).boundingBox())!;
  expect(total.x + total.width).toBeLessThanOrEqual(action.x);
  await expect(page.locator(".merch-shop-toolbar").getByRole("link", { name: "คำสั่งซื้อของฉัน" })).toBeVisible();
});
test("last cart row stays above the bar on a phone", async ({ page, fake }) => {
  const ps = [1, 2, 3].map((i) => makeSingle({ id: uid(i), nameTh: `สินค้า ${i}` }));
  fake.products = ps;
  for (const p of ps) fake.seedLine({ productId: p.id, variantId: p.variants[0].id, bundleSelections: [], quantity: 1 });
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page); await page.goto("/th/souvenirs/cart");
  const trash = page.getByRole("button", { name: "ลบ สินค้า 3" });
  await trash.scrollIntoViewIfNeeded();
  const t = (await trash.boundingBox())!, bar = (await page.locator(".merch-checkout-bar").boundingBox())!;
  expect(t.y + t.height).toBeLessThanOrEqual(bar.y + 1);
});
```

In `cart.spec.ts`: replace the `summary` locator with `page.locator(".merch-checkout-bar-total")` and expect only the total values (`฿400.00`, `฿650.00`, `฿550.00`); delete the subtotal/shipping assertions that relied on the summary card; replace `.merch-cart-total` with `.merch-checkout-bar-total`. For an invalid-only cart (existing "proceed disabled" test) also assert the total text contains "—".

- [ ] **Step 2: Run** `cart-layout.spec.ts cart.spec.ts --project=chromium` — Expected: FAIL.

- [ ] **Step 3: Implement**
  - `CheckoutBar.tsx` per the interface.
  - `CartScreen.tsx`: render `<ShopToolbar start={<Link className="merch-cart-back" …>กลับ</Link>} />` in place of the bare back link; delete `<aside className="merch-cart-summary">`, the bottom "คำสั่งซื้อของฉัน" link and the local bar `useLayoutEffect`; replace `.merch-cart-bar` with `<CheckoutBar totalBaht={data.amounts?.totalBaht ?? null}><button … onClick={proceed}>{busy ? "กำลังตรวจสอบตะกร้า" : "ดำเนินการสั่งซื้อ"}<ArrowRight/></button></CheckoutBar>`.
  - `CartRow.tsx`: grid `[image 80px] [detail]`; detail rows: `h2` name; a flex row with `<p className="merch-cart-row-option">{options || bundle summary}</p>` left and the stepper form + trash right; `merch-cart-unit-price`; then the existing notices, bundle component list, "บันทึกจำนวน", "เปลี่ยนตัวเลือก", "ดูตัวเลือกสินค้า". Remove the "รวมรายการ" paragraph. Stepper metrics match Task 3 (`44px 50px 44px` grid).
  - `cart.css`: `.merch-cart-grid` single column; delete `.merch-cart-summary*`, `.merch-cart-total*`, `.merch-cart-bar*`; add `.merch-checkout-bar*`; under 360 px the option row wraps with stepper+trash right-aligned.

- [ ] **Step 4: Run** `cart-layout.spec.ts cart.spec.ts accessibility.spec.ts --project=chromium` and `--project=mobile-safari` for `cart-layout.spec.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/CheckoutBar.tsx src/components/merchandise/CartScreen.tsx src/components/merchandise/CartRow.tsx src/components/merchandise/cart.css tests/merchandise/cart.spec.ts tests/merchandise/cart-layout.spec.ts
git commit -m "feat(merchandise): cart rows, shared checkout bar and no summary card"
```

---

### Task 5: Address step — required asterisks, no summary card, shared bar

**Files:**
- Modify: `src/components/merchandise/RecipientForm.tsx`, `CheckoutScreen.tsx` (address branch only), `checkout.css`
- Test: `tests/merchandise/checkout-address.spec.ts`

**Interfaces:**
- Consumes: `CheckoutBar` (Task 4).

- [ ] **Step 1: Write the failing test**

```ts
test("required fields show a red asterisk without changing their names", async ({ page, fake }) => {
  seedCheckout(fake); await login(page); await openCheckout(page);
  for (const label of ["ชื่อ–นามสกุลผู้รับ", "เบอร์โทรผู้รับ", "ที่อยู่", "ตำบล/แขวง", "อำเภอ/เขต", "จังหวัด", "รหัสไปรษณีย์"]) {
    const field = page.getByLabel(label, { exact: true });
    await expect(field).toHaveAttribute("required", "");
    const star = page.locator(`label[for="${await field.getAttribute("id")}"] .merch-required`);
    await expect(star).toHaveText("*");
    await expect(star).toHaveCSS("color", "rgb(220, 38, 38)");
  }
  await expect(page.locator(".merch-required")).toHaveCount(7);
  await expect(page.getByRole("complementary", { name: "สรุปคำสั่งซื้อ" })).toHaveCount(0);
  await expect(page.locator(".merch-checkout-bar-total")).toContainText("รวมยอดสินค้า");
  await expect(toReviewButton(page)).toBeVisible();
});
```

(`RecipientForm` renders exactly these 7 required fields plus optional "ชื่อบริษัท" and "หมายเหตุจัดส่ง", which get no star.)

- [ ] **Step 2: Run** `checkout-address.spec.ts --project=chromium` — Expected: FAIL.

- [ ] **Step 3: Implement** — in `RecipientForm.field()` add `{!optional && <span className="merch-required" aria-hidden="true">*</span>}` after the label text; `.merch-required { color:#dc2626; margin-left:2px }`. In `CheckoutScreen` delete `CheckoutSummary` and its usage plus the local bar `useLayoutEffect`; the address-step bar becomes `<CheckoutBar totalBaht={contextCart.data?.amounts?.totalBaht ?? null}><button type="submit" form="merch-recipient-form" …>ตรวจสอบคำสั่งซื้อ<ArrowRight/></button></CheckoutBar>`; `.merch-cart-grid` content is a single column.

- [ ] **Step 4: Run** `checkout-address.spec.ts order-confirmation.spec.ts --project=chromium` — Expected: PASS (order-confirmation proves `fillAddress` still finds every label by exact name).

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/RecipientForm.tsx src/components/merchandise/CheckoutScreen.tsx src/components/merchandise/checkout.css tests/merchandise/checkout-address.spec.ts
git commit -m "feat(merchandise): mark required address fields and use the shared bar"
```

---

### Task 6: Review step layout

**Files:**
- Modify: `src/lib/merchandiseRecipient.ts`, `src/lib/merchandiseRecipient.test.ts`
- Modify: `src/components/merchandise/CheckoutScreen.tsx` (`ReviewBody` and review-step bar), `checkout.css`
- Create: `public/assets/Img/payment/thai-qr.webp` (copy of `C:\Users\JaoNo\Downloads\Thai_QR_Logo.svg.webp`)
- Test: `tests/merchandise/order-confirmation.spec.ts`

**Interfaces:**
- Consumes: `CheckoutBar` (Task 4).
- Produces: `formatRecipientLine(r: Recipient): string` in `merchandiseRecipient.ts` — non-empty parts joined by one space: `fullName phone company addressLine subdistrict district province postalCode ประเทศไทย` (company omitted when empty; `deliveryNote` not included).

- [ ] **Step 1: Write failing unit tests**

```ts
test("recipient line joins parts with single spaces and ends with ประเทศไทย", () =>
  assert.equal(formatRecipientLine({ fullName: "ผู้รับ ทดสอบ", phone: "0812345678", company: "", addressLine: "99 ถนนสังเคราะห์", subdistrict: "ตำบลทดสอบ", district: "อำเภอทดสอบ", province: "กรุงเทพมหานคร", postalCode: "10100", deliveryNote: "" } as Recipient),
    "ผู้รับ ทดสอบ 0812345678 99 ถนนสังเคราะห์ ตำบลทดสอบ อำเภอทดสอบ กรุงเทพมหานคร 10100 ประเทศไทย"));
test("company is included after the phone when present", () =>
  assert.equal(formatRecipientLine({ ...base, company: "บริษัท ก" }),
    "ผู้รับ ทดสอบ 0812345678 บริษัท ก 99 ถนนสังเคราะห์ ตำบลทดสอบ อำเภอทดสอบ กรุงเทพมหานคร 10100 ประเทศไทย"));
```

(`Recipient` is `{ fullName, phone, addressLine, subdistrict, district, province, postalCode, company: string | null, deliveryNote: string | null }`; define `base` once with `company: null, deliveryNote: null` and reuse it in the first test.)

- [ ] **Step 2: Run** `npx tsx --test src/lib/merchandiseRecipient.test.ts` — Expected: FAIL; implement `formatRecipientLine`; run again — Expected: PASS.

- [ ] **Step 3: Write failing UI tests** in `order-confirmation.spec.ts`

```ts
test("review shows one-line address, compact items, PromptPay radio and payment info", async ({ page, fake }) => {
  seedCheckout(fake); await login(page); await openCheckout(page); await reachReview(page);
  await expect(page.locator(".merch-review-address")).toHaveText(/^ผู้รับ คนละคน 0812345678 99 ถนนสังเคราะห์ ตำบลทดสอบ อำเภอทดสอบ กรุงเทพมหานคร 10100 ประเทศไทย$/);
  await expect(page.locator(".merch-review-item .merch-review-qty")).toHaveText("x1");
  const radio = page.getByRole("radio", { name: "QR พร้อมเพย์" });
  await expect(radio).toBeChecked();
  await expect(page.locator(".merch-payment-option img")).toHaveAttribute("src", /thai-qr\.webp/);
  const info = page.getByRole("region", { name: "ข้อมูลการชำระเงิน" });
  for (const row of ["รวมคำสั่งซื้อ", "ค่าจัดส่ง", "ยอดชำระเงินทั้งหมด"]) await expect(info).toContainText(row);
  for (const gone of ["การผลิต", "การจัดส่ง", "ชำระเงินด้วย", "สรุปคำสั่งซื้อ"])
    await expect(page.getByRole("heading", { name: gone, exact: true })).toHaveCount(0);
  await expect(confirmButton(page)).toBeVisible();
});
test("review lock notice stays above the bar on a phone", async ({ page, fake }) => {
  seedCheckout(fake); await page.setViewportSize({ width: 375, height: 812 });
  await login(page); await openCheckout(page); await reachReview(page);
  const lock = page.locator(".merch-review-lock");
  await lock.scrollIntoViewIfNeeded();
  const l = (await lock.boundingBox())!, bar = (await page.locator(".merch-checkout-bar").boundingBox())!;
  expect(l.y + l.height).toBeLessThanOrEqual(bar.y + 1);
});
```

(`fillAddress` types `081-234-5678`; `validateRecipient` → `normalizePhone` returns `0812345678`, which is what the review shows.)

- [ ] **Step 4: Run** `order-confirmation.spec.ts --project=chromium` — Expected: FAIL.

- [ ] **Step 5: Implement `ReviewBody`** in this order: section "ที่อยู่จัดส่ง" (`<p className="merch-review-address">{formatRecipientLine(recipient)}</p>` + note line); section "รายการสินค้า" (`article.merch-review-item`: image | name / option or bundle components / row with unit price left and `<span className="merch-review-qty">x{quantity}</span>` right); section "ช่องทางการชำระเงิน" (`<label className="merch-payment-option"><img src="/assets/Img/payment/thai-qr.webp" alt="" width={32} height={32}/>QR พร้อมเพย์<input type="radio" name="payment-method" checked readOnly/></label>`); `<section aria-labelledby=…>` "ข้อมูลการชำระเงิน" with a `dl` of the three rows (total row bold); then the existing lock notice. Delete การผลิต / การจัดส่ง / ชำระเงินด้วย sections and the `productionInfoTh`/`shippingInfoTh` props. Review bar: `<CheckoutBar totalBaht={cart?.amounts?.totalBaht ?? null}>` wrapping the existing confirm / retry button with unchanged labels. Copy the logo file.

- [ ] **Step 6: Run** `npx tsx --test src/lib/merchandiseRecipient.test.ts` and `order-confirmation.spec.ts checkout-address.spec.ts accessibility.spec.ts --project=chromium` — Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/merchandiseRecipient.ts src/lib/merchandiseRecipient.test.ts src/components/merchandise/CheckoutScreen.tsx src/components/merchandise/checkout.css public/assets/Img/payment/thai-qr.webp tests/merchandise/order-confirmation.spec.ts
git commit -m "feat(merchandise): compact review step with PromptPay option and payment info"
```

---

### Task 7: Payment page — QR-only view, just-paid countdown, history detail unchanged

**Files:**
- Create: `src/components/merchandise/useRedirectCountdown.ts`
- Modify: `src/components/merchandise/OrderScreen.tsx`, `PaymentQr.tsx`, `PaidOrder.tsx`, `order.css`
- Modify: `src/lib/merchandisePayment.ts:124`, `src/lib/merchandisePayment.test.ts:92`
- Test: `tests/merchandise/payment-state.spec.ts`, `tests/merchandise/order-confirmation.spec.ts`

**Interfaces:**
- Produces: `useRedirectCountdown(active: boolean, seconds: number, to: "/souvenirs/orders"): number` — while `active`, decrements once per second from `seconds`; at 0 calls `router.replace(to)` once; clears its interval on unmount or when `active` turns false; returns the remaining seconds.
- Produces: `JustPaidCard({ orderNumber }: { orderNumber: string }): JSX.Element` exported from `PaidOrder.tsx` — success icon, `<h2>ชำระเงินสำเร็จ</h2>`, `<Link href="/souvenirs/orders" className="merch-just-paid-button">ไปหน้ารายการคำสั่งซื้อ</Link>`, and `<p>จะพาไปหน้ารายการคำสั่งซื้อใน {n} วินาที</p>`; an `aria-live="polite"` sr-only span updated only at 10, 5 and 0.

- [ ] **Step 1: Update the copy test** — `merchandisePayment.test.ts:92` expects `"ใช้แอปธนาคารสแกน QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร"`; run `npx tsx --test src/lib/merchandisePayment.test.ts` — Expected: FAIL; change `merchandisePayment.ts:124` to that string; run — Expected: PASS. Update the matching `qr_active` `text` in `payment-state.spec.ts`.

- [ ] **Step 2: Write failing UI tests** in `payment-state.spec.ts`

```ts
test("unpaid order shows only the QR card with the PRIS logo", async ({ page, fake }) => {
  seed(fake); await open(page);
  await expect(page.locator(".merch-pay-card img[alt='PRIS 2026']")).toBeVisible();
  await expect(heading(page, "รอชำระเงิน")).toBeVisible();
  await expect(page.getByRole("link", { name: "กลับหน้าประวัติ" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "บันทึกภาพ QR" })).toHaveCount(0);
  await expect(page.locator(".merch-order-item")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "ผู้รับ" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: `คำสั่งซื้อ ${NUMBER}` })).toBeAttached();
});
test("paying while on the page counts down 10 seconds then opens the order list", async ({ page, fake }) => {
  seed(fake); await page.clock.install(); await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  fake.setPayment(ids.order, { state: "paid", canCheck: false, attempt: null });
  await page.clock.runFor(10_000);
  await expect(heading(page, "ชำระเงินสำเร็จ")).toBeVisible();
  await expect(page.getByText("จะพาไปหน้ารายการคำสั่งซื้อใน 10 วินาที")).toBeVisible();
  await page.clock.runFor(5_000);
  await expect(page.getByText("จะพาไปหน้ารายการคำสั่งซื้อใน 5 วินาที")).toBeVisible();
  await page.clock.runFor(5_000);
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders$/);
});
test("the just-paid button opens the order list at once", async ({ page, fake }) => {
  seed(fake); await page.clock.install(); await open(page);
  await expect(page.getByRole("img", { name: /^QR สำหรับ/ })).toBeVisible();
  fake.setPayment(ids.order, { state: "paid", canCheck: false, attempt: null });
  await page.clock.runFor(10_000);
  await page.getByRole("link", { name: "ไปหน้ารายการคำสั่งซื้อ" }).click();
  await expect(page).toHaveURL(/\/th\/souvenirs\/orders$/);
});
test("an order already paid on load shows details and never redirects", async ({ page, fake }) => {
  seed(fake, { paymentStatus: "paid", paidAt: now, payment: view({ state: "paid", attempt: null, ...noButtons }) });
  await page.clock.install(); await open(page);
  await expect(page.getByRole("link", { name: "กลับหน้าประวัติ" })).toBeVisible();
  await expect(heading(page, "ยังไม่จัดส่ง")).toBeVisible();
  await page.clock.runFor(15_000);
  await expect(page).toHaveURL(new RegExp(`/souvenirs/orders/${ids.order}$`));
});
test("verifying after QR shows no countdown", async ({ page, fake }) => {
  seed(fake); await page.clock.install(); await open(page);
  fake.setPayment(ids.order, { state: "verifying", canCheck: false });
  await page.clock.runFor(15_000);
  await expect(page.getByText(/จะพาไปหน้ารายการคำสั่งซื้อ/)).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`/souvenirs/orders/${ids.order}$`));
});
```

Also: delete the "บันทึกภาพ QR" download assertions in the QR-decode test and expect the hint "กดค้างที่รูป QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร"; in "polling … then stops once paid" stop asserting after the redirect (assert `orderGets` stays flat over the first 9 s after the success heading, then URL is the list); change "the order page lists bundle components, server amounts, recipient and shop info" to seed a **paid** order so it exercises the detail view.

- [ ] **Step 3: Run** `payment-state.spec.ts --project=chromium` — Expected: FAIL on the new tests.

- [ ] **Step 4: Implement**
  - `useRedirectCountdown.ts` per the interface (uses `useRouter` from `@/i18n/routing`).
  - `OrderWorkspace`: `const initialPaid = useRef(isPaid(initial)).current;` then: `!paid` → pay view; `paid && !initialPaid` → just-paid view; `paid && initialPaid` → today's detail markup unchanged. Pay and just-paid views render `<main className="merch-cart merch-order merch-pay">` with `<h1 className="sr-only">คำสั่งซื้อ {orderNumber}</h1>` and `<div className="merch-pay-card">` holding `<Image src="/assets/Img/logo/Logo-Final .png" alt="PRIS 2026" width={200} height={80} className="brightness-0 h-12 w-auto mx-auto"/>` then `PaymentPanel` or `JustPaidCard`. No back link, no items, no recipient, no shop info in those two views.
  - `PaymentQr.tsx`: remove the download `<a>` and the `Download` import; hint text becomes "กดค้างที่รูป QR หรือแคปหน้าจอ แล้วเลือกรูปในแอปธนาคาร".
  - `order.css`: `.merch-pay-card { max-width:440px; margin:24px auto 0; background:#fff; border-radius:20px; padding:28px 24px; text-align:center }`; `.merch-just-paid-button` styled like the orange bar button, min-height 48px.

- [ ] **Step 5: Run** `npx tsx --test src/lib/merchandisePayment.test.ts` and `payment-state.spec.ts order-confirmation.spec.ts order-history.spec.ts --project=chromium` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/merchandise/useRedirectCountdown.ts src/components/merchandise/OrderScreen.tsx src/components/merchandise/PaymentQr.tsx src/components/merchandise/PaidOrder.tsx src/components/merchandise/order.css src/lib/merchandisePayment.ts src/lib/merchandisePayment.test.ts tests/merchandise/payment-state.spec.ts tests/merchandise/order-confirmation.spec.ts
git commit -m "feat(merchandise): QR-only payment view with post-payment countdown to the order list"
```

---

### Task 8: Full verification

- [ ] **Step 1:** `npm test` — Expected: all unit tests pass.
- [ ] **Step 2:** `npm run lint` and `npx tsc --noEmit` — Expected: no errors.
- [ ] **Step 3:** `npx playwright test -c playwright.merchandise.config.ts` (all four projects) — Expected: all pass; record any failure with its output rather than skipping it.
- [ ] **Step 4:** Manual look in the browser (`npm run dev`, port 3001) at 375, 768 and 1440 px: header alignment with the cart badge, storefront toolbar, cart row, address asterisks, review layout, pay card, just-paid countdown. Note anything off in the PR description.
- [ ] **Step 5:** `git status` shows only the pre-existing uncommitted files from before this plan (or none if they were folded into a task commit with the user's OK).
