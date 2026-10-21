# Souvenir UI Refresh Round 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the round-1 visual bugs, replace the fixed bottom bar with a sticky right panel on tablet/desktop, give products real visual weight, and tighten the payment and order-history pages of the `/souvenirs` shop.

**Architecture:** Presentation changes in the Next.js app (`Pris2026`) plus one data-contract change (`shippingBaht` widened with a cap). `CheckoutBar` keeps one DOM and switches layout in CSS at 768 px. Three new small components (`ProductImagePlaceholder`, `CheckoutSteps`, `StoreInfoBanner`) and one skeleton file are shared across pages. No API changes.

**Tech Stack:** Next.js App Router + next-intl, React, plain CSS in `src/components/merchandise/`, `react-hot-toast`, `node:test` via `tsx`, Playwright (`playwright.merchandise.config.ts`, fake API `tests/merchandise/fakeApi.ts`).

**Spec:** `docs/superpowers/specs/2026-10-17-souvenir-ui-refresh-round2-design.md`

## Global Constraints

- Work in an isolated worktree branched from `feat/merchandise-preorder` (`d00da3e` or later); stage files by name; never bare `git stash`.
- Breakpoints: phone `<768px`; tablet/desktop `≥768px`; wide `≥1024px`.
- Containers: storefront max width `1200px`; detail, cart, checkout, order and history pages `1160px`; gutter `20px` (`16px` below `360px`).
- Flow grid (≥768): content `minmax(0,1fr)`, gap `24px`, panel `280px` (768–1023) / `320px` (≥1024).
- Colours: blue `#0055ff` = choose/add; orange `#ff5800` = move through checkout and pay; ink `#0b1535`; muted `#526787`; secondary `#3b4b66`; border `#d4def0`; page `#f4f8fc`; placeholder `#e9eff8`.
- Panel: white, radius `16px`, padding `20px`, border `1px solid #d4def0`, sticky `top: calc(var(--merch-host-header-height, 76px) + 24px)`.
- Bar/panel label: cart and address "รวมยอดสินค้า"; review "ยอดชำระเงินทั้งหมด".
- No shop text below `13px`; step labels, hints and secondary text `14px`.
- Copy is hard-coded Thai exactly as written here and in the spec.
- Orange/blue buttons keep 19px bold text (WCAG large text) as round 1 established.
- Interactive targets ≥ 44×44 px; no horizontal scroll at 320–1920 px.
- UI tests: `npx playwright test -c playwright.merchandise.config.ts <spec> --project=chromium --reporter=line` (own dev server on :3102). Unit: `npx tsx --test <file>`. Also `npx tsc --noEmit`, eslint on touched files.
- The shop header renders two `.merch-header-cart` buttons; use `:visible` in tests.

## Review Focus

1. Narrowest tablet (768 px): cart rows and the review page must not overflow beside the 280 px panel → Task 3 test `no horizontal scroll beside the panel at 768`.
2. Resizing a phone window to desktop must drop the bottom padding the bar reserved → Task 3 test `bar height variable follows the layout on resize`.
3. A stale or hostile `pris_merch_storefront_url` value (e.g. `//evil.test`, `/profile`) must never become the back link → Task 7 test `back link ignores an unsafe saved storefront URL`.
4. An open store with `closesAt: null` must show no date line and no "Invalid Date" → Task 6 test `open store without a close date shows no date line`.
5. A product image that fails to load must keep the card's square size and show the placeholder → Task 6 test `broken product image falls back to the placeholder`.

---

### Task 1: Shared base — page background, shipping fee, dev diagnostics

**Files:**
- Modify: `src/types/merchandise.ts` (`StoreDto.shippingBaht`, `Amounts.shippingBaht` → `number`)
- Modify: `src/lib/merchandiseResponse.ts` (`shippingBaht` checks; failure path), `src/lib/merchandiseResponse.test.ts`
- Modify: `src/lib/merchandiseFormat.ts`, `src/lib/merchandiseFormat.test.ts`
- Modify: `src/lib/merchandiseApi.ts` (`data()` failure branch)
- Modify: `src/components/merchandise/storefront-host.css` (`.merchandise-route-scope`), `cart.css` (drop `min-height: 65vh` on `.merch-cart`)
- Test: `tests/merchandise/shell.spec.ts`

**Interfaces:**
- Produces: `shippingFeeLabel(baht: number): string` in `merchandiseFormat.ts` — `0` → `"จัดส่งฟรี"`, `n` → `` `ค่าจัดส่ง ${formatBaht(n)} ต่อออเดอร์` ``.
- Produces: `consumeInvalidPath(): string | null` in `merchandiseResponse.ts` — returns the dotted key path of the most recent failed `shape` check (e.g. `"shippingBaht"`, `"amounts.shippingBaht"`) and clears it.

- [ ] **Step 1: Write failing unit tests**

```ts
// merchandiseFormat.test.ts
test("shipping fee label", () => {
  assert.equal(shippingFeeLabel(0), "จัดส่งฟรี");
  assert.equal(shippingFeeLabel(50), "ค่าจัดส่ง ฿50.00 ต่อออเดอร์");
  assert.equal(shippingFeeLabel(120), "ค่าจัดส่ง ฿120.00 ต่อออเดอร์");
});
// merchandiseResponse.test.ts — replace the two cart shippingBaht assertions (100 and 5000 → false)
test("shipping fee is whole baht between 0 and 1000", () => {
  for (const ok of [0, 50, 100, 1000]) assert.equal(storeResponse({ ...validStore, shippingBaht: ok }), true);
  for (const bad of [-1, 1.5, 1001, 5000, "50"]) assert.equal(storeResponse({ ...validStore, shippingBaht: bad }), false);
  assert.equal(cartResponse({ ...cart, amounts: { ...amounts, shippingBaht: 0 } }), true);
  assert.equal(cartResponse({ ...cart, amounts: { ...amounts, shippingBaht: 5000 } }), false); // satang guard kept
});
test("a failed check reports its field path once", () => {
  storeResponse({ ...validStore, shippingBaht: -1 });
  assert.equal(consumeInvalidPath(), "shippingBaht");
  assert.equal(consumeInvalidPath(), null);
  cartResponse({ ...cart, amounts: { ...amounts, shippingBaht: -1 } });
  assert.equal(consumeInvalidPath(), "amounts.shippingBaht");
});
```

- [ ] **Step 2: Run** `npx tsx --test src/lib/merchandiseFormat.test.ts src/lib/merchandiseResponse.test.ts` — Expected: FAIL (`shippingFeeLabel` / `consumeInvalidPath` missing; 0 rejected).

- [ ] **Step 3: Implement the lib changes**
  - Shipping check: `const shippingFee: Check = (v) => natural(v) && (v as number) <= 1000;` used for both `shippingBaht` fields (the 1000 cap keeps rejecting satang-scaled values such as 5000 — controller ruling on top of the spec's "non-negative integer").
  - Path tracking: a module-level `string[]`; when a field check inside `shape` fails, `unshift` that key (nested shapes fail first, so the outer key ends up in front). `consumeInvalidPath` joins with `"."`, clears the array, and returns `null` when it was empty. Before running a top-level check, `data()` calls `consumeInvalidPath()` once to discard anything left over.
  - `merchandiseApi.ts` `data()`: when `check(body.data)` fails, `const failed = consumeInvalidPath();` then, if `process.env.NODE_ENV !== "production"`, `console.warn(\`[merchandise] invalid response from ${path}\`, failed ?? "(shape)")` (`path` is the endpoint argument `data()` already has).
  - Types: both `shippingBaht` fields → `number`; fix any compile errors this surfaces.
  - Run the unit tests — Expected: PASS.

- [ ] **Step 4: Write the failing UI test** in `shell.spec.ts` (before touching any CSS)

```ts
test("short shop pages never show the dark site background", async ({ page, fake }) => {
  const p = makeSingle(); fake.products = [p];
  for (const size of [{ width: 1440, height: 1000 }, { width: 440, height: 956 }]) {
    await page.setViewportSize(size);
    await page.goto(`/th/souvenirs/products/${p.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const color = await page.evaluate(() => {
      const y = window.innerHeight - 4;
      const el = document.elementFromPoint(window.innerWidth / 2, y)!;
      let n: Element | null = el;
      while (n && getComputedStyle(n).backgroundColor === "rgba(0, 0, 0, 0)") n = n.parentElement;
      return n ? getComputedStyle(n).backgroundColor : "none";
    });
    expect(color).not.toBe("rgb(0, 0, 0)");
    expect(color).not.toMatch(/^rgb\((1[0-9]|[0-9]), /); // no near-black
  }
});
```

- [ ] **Step 5: Run** `shell.spec.ts -g "dark site background"` — Expected: FAIL (dark band below the short page).

- [ ] **Step 6: Fix the background** — `.merchandise-route-scope { background: #f4f8fc; min-height: 100svh; }` in `storefront-host.css`; remove `min-height: 65vh` from `.merch-cart` in `cart.css`.

- [ ] **Step 7: Run** `npx tsx --test src/lib/merchandise*.test.ts`, `npx tsc --noEmit`, `shell.spec.ts` — Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/types/merchandise.ts src/lib/merchandiseResponse.ts src/lib/merchandiseResponse.test.ts src/lib/merchandiseFormat.ts src/lib/merchandiseFormat.test.ts src/lib/merchandiseApi.ts src/components/merchandise/storefront-host.css src/components/merchandise/cart.css tests/merchandise/shell.spec.ts
git commit -m "fix(merchandise): light shop background, capped shipping fee and response diagnostics"
```

---

### Task 2: Shared components — image placeholder and checkout steps

**Files:**
- Create: `src/components/merchandise/ProductImagePlaceholder.tsx`, `src/components/merchandise/CheckoutSteps.tsx`
- Modify: `src/components/merchandise/CartScreen.tsx`, `CheckoutScreen.tsx` (replace the two `<ol className="merch-checkout-steps">` blocks), `cart.css` / `checkout.css` (step styles; placeholder styles in `storefront-view.css`)
- Test: `tests/merchandise/cart-layout.spec.ts`, `tests/merchandise/checkout-address.spec.ts`

**Interfaces:**
- Produces: `ProductImagePlaceholder({ failed = false }: { failed?: boolean }): JSX.Element` — `<span className="merch-image-placeholder">` filling its parent box (width/height 100%), background `#e9eff8`, PRIS logo `/assets/Img/logo/Logo-Final .png` at 25 % opacity, `brightness-0`, max 40 % of box width, plus `<span className="sr-only">` "ยังไม่มีรูปสินค้า" (or "โหลดรูปภาพไม่สำเร็จ" when `failed`).
- Produces: `CheckoutSteps({ current }: { current: 0 | 1 | 2 | 3 }): JSX.Element` — `<ol className="merch-steps" aria-label="ขั้นตอนสั่งซื้อ">` with labels "ตะกร้า", "ที่อยู่", "ตรวจสอบ", "ชำระเงิน"; `aria-current="step"` on `current`; indexes below `current` show a check icon and `data-completed="true"`.

- [ ] **Step 1: Write failing tests**

```ts
// cart-layout.spec.ts
test("checkout steps are one compact component with connectors", async ({ page, fake }) => {
  seedOne(fake); await login(page); await page.goto("/th/souvenirs/cart");
  const steps = page.getByRole("list", { name: "ขั้นตอนสั่งซื้อ" });
  await expect(steps).toHaveClass(/merch-steps/);
  expect((await steps.boundingBox())!.width).toBeLessThanOrEqual(640);
  await expect(steps.locator('[aria-current="step"]')).toContainText("ตะกร้า");
  expect(parseFloat(await steps.locator("li").nth(1).evaluate((e) => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(14);
});
// checkout-address.spec.ts — on the review step
//   steps.locator('[data-completed="true"]') has count 2 and '[aria-current="step"]' contains "ตรวจสอบ"
```

(`seedOne` = the file's existing single-line seed helper, or `fake.seedLine` with `makeSingle()`.)

- [ ] **Step 2: Run** both specs `-g "steps"` — Expected: FAIL (class `merch-steps` missing).

- [ ] **Step 3: Implement** both components and swap them in. Steps CSS: horizontal flex, max-width 640px, each step = dot (24px circle) + label (14px); a 2px connector between dots, `#0055ff` up to the current step, `#d4def0` after; current label bold `#0b1535`, others `#526787`. The placeholder is only created here; Tasks 4–7 use it.

- [ ] **Step 4: Run** `cart-layout.spec.ts cart.spec.ts checkout-address.spec.ts order-confirmation.spec.ts accessibility.spec.ts` — Expected: PASS (update any old selector `.merch-checkout-steps` in tests to the role/name locator).

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/ProductImagePlaceholder.tsx src/components/merchandise/CheckoutSteps.tsx src/components/merchandise/CartScreen.tsx src/components/merchandise/CheckoutScreen.tsx src/components/merchandise/cart.css src/components/merchandise/checkout.css src/components/merchandise/storefront-view.css tests/merchandise/cart-layout.spec.ts tests/merchandise/checkout-address.spec.ts
git commit -m "feat(merchandise): shared checkout steps and product image placeholder"
```

---

### Task 3: CheckoutBar becomes a sticky panel on tablet/desktop

**Files:**
- Modify: `src/components/merchandise/CheckoutBar.tsx`, `cart.css` (bar/panel/flow styles)
- Modify: `src/components/merchandise/CartScreen.tsx`, `CheckoutScreen.tsx` (wrap content + bar in the flow grid; review passes `label`/`details`)
- Test: `tests/merchandise/cart-layout.spec.ts`, `tests/merchandise/order-confirmation.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `CheckoutBar({ totalBaht, label = "รวมยอดสินค้า", details, children }: { totalBaht: number | null; label?: string; details?: ReactNode; children: ReactNode })`. Root keeps class `merch-checkout-bar` and becomes the flow aside. `details` renders inside `<div className="merch-checkout-bar-details">`, shown only at ≥768. When `details` is given, `.merch-checkout-bar-total` is hidden at ≥768 (the table carries the total).
- Produces: flow grid classes `.merch-flow` (grid wrapper), `.merch-flow-main` (content column); the bar is the second child of `.merch-flow`.

- [ ] **Step 1: Write failing tests** (`cart-layout.spec.ts` unless noted)

```ts
test("the action is a sticky right panel at 1024 and a fixed bar at 390", async ({ page, fake }) => {
  seedOne(fake); await login(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/th/souvenirs/cart");
  const bar = page.locator(".merch-checkout-bar");
  await expect(bar).toHaveCSS("position", "sticky");
  const main = (await page.locator(".merch-flow-main").boundingBox())!, panel = (await bar.boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(main.x + main.width);
  expect(panel.width).toBeCloseTo(320, 0);
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--merch-host-bar-height"))).toBe("");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(bar).toHaveCSS("position", "fixed");
});
test("bar height variable follows the layout on resize", async ({ page, fake }) => {
  seedOne(fake); await login(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/th/souvenirs/cart");
  await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--merch-host-bar-height"))).not.toBe("");
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--merch-host-bar-height"))).toBe("");
});
test("no horizontal scroll beside the panel at 768", async ({ page, fake }) => {
  // seed an options product with image + a single product; 768x1024
  // cart: scrollWidth == 768; panel width ≈ 280; busy-free button scrollWidth <= clientWidth
  // then reach review (fillAddress) and assert scrollWidth == 768 again
});
// order-confirmation.spec.ts
test("review puts payment info and the lock notice in the panel at 1024, inline at 390", async ({ page, fake }) => {
  seedCheckout(fake); await login(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  await openCheckout(page); await reachReview(page);
  const panel = page.locator(".merch-checkout-bar");
  await expect(panel.getByRole("region", { name: "ข้อมูลการชำระเงิน" })).toBeVisible();
  await expect(panel.locator(".merch-review-lock")).toBeVisible();
  await expect(page.locator(".merch-flow-main").getByRole("region", { name: "ข้อมูลการชำระเงิน" })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".merch-flow-main").getByRole("region", { name: "ข้อมูลการชำระเงิน" })).toBeVisible();
  await expect(panel.locator(".merch-checkout-bar-total")).toContainText("ยอดชำระเงินทั้งหมด");
});
```

Write the 768 test fully in the file's style from the comments above (they state every assertion).

- [ ] **Step 2: Run** `cart-layout.spec.ts order-confirmation.spec.ts -g "panel|resize|768"` — Expected: FAIL (bar is fixed at every width).

- [ ] **Step 3: Implement**
  - CSS: `.merch-flow` is a block on phones; at ≥768 `display:grid; grid-template-columns: minmax(0,1fr) 280px; gap:24px; align-items:start` (320px at ≥1024). At ≥768 `.merch-checkout-bar` becomes `position: sticky` with the panel styles from Global Constraints, `flex-direction: column; align-items: stretch`, button full width; at <768 keep today's fixed bar rules. `.merch-checkout-bar-details { display:none }` <768.
  - `CheckoutBar`: the ResizeObserver callback sets `--merch-host-bar-height` only when `getComputedStyle(element).position === "fixed"`, otherwise removes it; also re-run it on `window` `resize`. Cleanup unchanged.
  - Cart and both checkout steps: wrap `<div className="merch-flow"><div className="merch-flow-main">…existing content after the steps…</div><CheckoutBar …/></div>`. Title, back link, toolbar and steps stay above the flow grid at full width.
  - Review: render the payment-info section twice — once in the content with class `merch-review-amounts-inline` (`display:none` at ≥768) and once via `details` (with the lock notice after it); give the two copies distinct heading ids. The inline lock notice gets `display:none` at ≥768 too. Pass `label="ยอดชำระเงินทั้งหมด"` on the review step.

- [ ] **Step 4: Run** `cart-layout.spec.ts cart.spec.ts checkout-address.spec.ts order-confirmation.spec.ts accessibility.spec.ts` (chromium) and `cart-layout.spec.ts --project=mobile-safari` — Expected: PASS. Fix older assertions that assumed a fixed bar at desktop width by setting a phone viewport in those tests (don't delete their checks).

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/CheckoutBar.tsx src/components/merchandise/cart.css src/components/merchandise/CartScreen.tsx src/components/merchandise/CheckoutScreen.tsx tests/merchandise/cart-layout.spec.ts tests/merchandise/order-confirmation.spec.ts
git commit -m "feat(merchandise): sticky checkout panel on tablet and desktop"
```

---

### Task 4: Cart rows and notices

**Files:**
- Modify: `src/components/merchandise/CartScreen.tsx` (`write()` success path), `CartRow.tsx`, `cart.css`
- Test: `tests/merchandise/cart.spec.ts`, `tests/merchandise/cart-layout.spec.ts`

**Interfaces:**
- Consumes: `ProductImagePlaceholder` (Task 2), `.merch-flow-main` (Task 3).

- [ ] **Step 1: Write failing tests**

```ts
// cart.spec.ts
test("removing an item shows a success toast, not a notice box", async ({ page, fake }) => {
  const a = makeSingle({ id: uid(1), nameTh: "แก้วน้ำ Pris" }), b = makeSingle({ id: uid(2), nameTh: "ถุงผ้า Pris" });
  fake.products = [a, b]; seed(fake, a); seed(fake, b);
  await login(page); await page.goto("/th/souvenirs/cart");
  await page.getByRole("button", { name: "ลบ ถุงผ้า Pris", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "นำสินค้าออกจากตะกร้าแล้ว" })).toBeVisible();
  await expect(page.locator(".merch-cart-notice")).toHaveCount(0);
});
test("quantity above one shows the line total", async ({ page, fake }) => {
  const p = makeSingle({ nameTh: "แก้วน้ำ Pris" }); fake.products = [p];
  fake.seedLine({ productId: p.id, variantId: p.variants[0].id, bundleSelections: [], quantity: 3 });
  await login(page); await page.goto("/th/souvenirs/cart");
  await expect(page.locator(".merch-cart-unit-price")).toHaveText("฿250.00 / ชิ้น · รวม ฿750.00");
});
// cart-layout.spec.ts
test("rows sit in one white card with an image column even without images", async ({ page, fake }) => {
  // makeSingle() has no images; expect .merch-cart-list background rgb(255, 255, 255),
  // each .merch-cart-row has a .merch-image-placeholder of width 80 (±1)
});
test("change-options is a button that toggles the selector", async ({ page, fake }) => {
  // options product in cart; getByRole("button", { name: "แก้ไขตัวเลือก" }) has aria-expanded="false";
  // click → "true" and the variant selector is visible
});
```

(Write the two commented tests fully from their comments. Before relying on `getByRole("status")` for the toast, confirm react-hot-toast renders `role="status"`; if not, locate the toast by text.)

- [ ] **Step 2: Run** `cart.spec.ts cart-layout.spec.ts -g "toast|line total|white card|change-options"` — Expected: FAIL.

- [ ] **Step 3: Implement**
  - `write()` success: `toast.success(done)` (id per message to avoid stacking) instead of `setNotice(done)`; error paths unchanged. The notice box renders its retry/re-login button only for errors (it now only ever holds errors).
  - `CartRow`: always render the 80 px image cell (`Image` or `ProductImagePlaceholder`, `failed` on `onError`); price text `${formatBaht(unit)} / ${unit word}` plus `` ` · รวม ${formatBaht(line.lineTotalBaht)}` `` when `line.quantity > 1` and `lineTotalBaht !== null`.
  - Replace `<details className="merch-cart-edit">` with a text button "แก้ไขตัวเลือก" (`aria-expanded`, `aria-controls`) placed after the option text; it toggles the same selector panel and save button.
  - Wrap the row list in `<div className="merch-cart-list">`: white, radius 16px, padding `8px 20px`, rows divided by `1px solid #d4def0`.

- [ ] **Step 4: Run** `cart.spec.ts cart-layout.spec.ts accessibility.spec.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/CartScreen.tsx src/components/merchandise/CartRow.tsx src/components/merchandise/cart.css tests/merchandise/cart.spec.ts tests/merchandise/cart-layout.spec.ts
git commit -m "feat(merchandise): cart rows in a card with line totals, success toasts and an edit button"
```

---

### Task 5: Address and review content

**Files:**
- Modify: `src/components/merchandise/RecipientForm.tsx`, `CheckoutScreen.tsx` (`ReviewBody`), `checkout.css`
- Test: `tests/merchandise/checkout-address.spec.ts`, `tests/merchandise/order-confirmation.spec.ts`

**Interfaces:**
- Consumes: `ProductImagePlaceholder` (Task 2), the review `details` split from Task 3 (keep it).

- [ ] **Step 1: Write failing tests**

```ts
// order-confirmation.spec.ts
test("review quantity sits at the row's right edge with or without an image", async ({ page, fake, context }) => {
  // seed one product with images (stubImages(context)) and one without; reachReview at 1024
  // for each .merch-review-item: qty = .merch-review-qty box, row = .merch-review-price box;
  // expect(Math.abs((qty.x + qty.width) - (row.x + row.width))).toBeLessThanOrEqual(2)
  // and row.width >= 300
});
test("review sections are separate white cards without doubled dividers", async ({ page, fake }) => {
  // reachReview; every .merch-review-section has background rgb(255, 255, 255) and border-bottom-width "0px"
});
test("the Thai QR logo is 24px tall", async ({ page, fake }) => {
  // reachReview; .merch-payment-option img height 24 (±1) and width > 24
});
// checkout-address.spec.ts
test("paired address fields share a row at 1024", async ({ page, fake }) => {
  // openCheckout at 1024; ตำบล/แขวง and อำเภอ/เขต inputs have equal y (±2) and different x;
  // same for จังหวัด and รหัสไปรษณีย์; at 390 they stack (different y)
});
```

Write each test fully from its comments.

- [ ] **Step 2: Run** both specs `-g "right edge|white cards|Thai QR|paired"` — Expected: FAIL.

- [ ] **Step 3: Implement**
  - Review: each `.merch-review-section` (address, items, method, inline payment info) is a white card (radius 16px, padding 20px, `border:0`), stacked with 16px gap. Items reserve the 80 px image cell (image or placeholder); the text column is `flex:1; min-width:0` so `.merch-review-price` (already `space-between`) spans the full width. Thai QR logo `height:24px; width:auto`.
  - Address form: inside a white card; at ≥1024 a 2-column grid where subdistrict+district and province+postalCode share rows, other fields span both columns.

- [ ] **Step 4: Run** `checkout-address.spec.ts order-confirmation.spec.ts accessibility.spec.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/RecipientForm.tsx src/components/merchandise/CheckoutScreen.tsx src/components/merchandise/checkout.css tests/merchandise/checkout-address.spec.ts tests/merchandise/order-confirmation.spec.ts
git commit -m "feat(merchandise): carded address and review sections with aligned quantities"
```

---

### Task 6: Storefront — info banner, toolbar row and vertical cards

**Files:**
- Create: `src/components/merchandise/StoreInfoBanner.tsx`
- Modify: `src/components/merchandise/StorefrontView.tsx`, `StorefrontClient.tsx`, `storefront-view.css`, `storefront-host.css`
- Test: `tests/merchandise/storefront.spec.ts`, `storefront-accessibility.spec.ts`, `accessibility.spec.ts`

**Interfaces:**
- Consumes: `shippingFeeLabel` (Task 1), `ProductImagePlaceholder` (Task 2).
- Produces: `StoreInfoBanner({ store }: { store: StoreDto }): JSX.Element` — `<section className="merch-store-info" aria-label="ข้อมูลการสั่งซื้อ">`.
- Produces (for Task 7): the storefront writes its canonical URL to `sessionStorage["pris_merch_storefront_url"]` whenever `canonical` changes (try/catch).

- [ ] **Step 1: Write failing tests** (`storefront.spec.ts`)

```ts
test("store info banner shows the close date and the shipping fee from the store", async ({ page, fake }) => {
  fake.store = makeStore({ shippingBaht: 0, shippingInfoTh: "รับที่หน้างาน" }); fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  const info = page.getByRole("region", { name: "ข้อมูลการสั่งซื้อ" });
  await expect(info).toContainText("พรีออเดอร์ของที่ระลึก PRIS 2026");
  await expect(info).toContainText("ปิดรับ 30 ต.ค. 2026");
  await expect(info).toContainText("จัดส่งฟรี");
  await expect(info).toContainText("รับที่หน้างาน");
  await expect(page.getByText(/จัดส่งทั่วไทย/)).toHaveCount(0);
  fake.store = makeStore({ shippingBaht: 50 }); await page.reload();
  await expect(info).toContainText("ค่าจัดส่ง ฿50.00 ต่อออเดอร์");
});
test("open store without a close date shows no date line", async ({ page, fake }) => {
  fake.store = makeStore({ closesAt: null }); fake.products = [makeSingle()];
  await page.goto("/th/souvenirs");
  const info = page.getByRole("region", { name: "ข้อมูลการสั่งซื้อ" });
  await expect(info).not.toContainText("ปิดรับ");
  await expect(info).not.toContainText("Invalid");
});
test("cards are vertical at 1440 with a 44px add button", async ({ page, fake }) => {
  fake.products = [makeSingle({ nameTh: "แก้วน้ำ Pris" })];
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto("/th/souvenirs");
  const media = (await page.locator(".merch-product-media").boundingBox())!;
  const name = (await page.getByRole("heading", { name: "แก้วน้ำ Pris" }).boundingBox())!;
  expect(name.y).toBeGreaterThan(media.y + media.height - 1);
  expect(Math.abs(media.width - media.height)).toBeLessThanOrEqual(1);
  const add = page.getByRole("button", { name: "เพิ่มลงตะกร้า", exact: true });
  const box = (await add.boundingBox())!; expect(box.width).toBeCloseTo(44, 0); expect(box.height).toBeCloseTo(44, 0);
  await expect(page.locator(".merch-preorder")).toHaveCount(0);
});
test("broken product image falls back to the placeholder", async ({ page, fake, context }) => {
  await context.route("https://img.example.test/**", (r) => r.fulfill({ status: 404 }));
  fake.products = [makeSingle({ images: [image(1)] })];
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-product-media .merch-image-placeholder")).toBeVisible();
  const m = (await page.locator(".merch-product-media").boundingBox())!;
  expect(Math.abs(m.width - m.height)).toBeLessThanOrEqual(1);
});
test("my orders link sits in the catalog heading row when logged in", async ({ page, fake }) => {
  // login; heading "สินค้าทั้งหมด" and link "คำสั่งซื้อของฉัน" have centres within 8px vertically,
  // link to the right of the heading; .merch-shop-toolbar count 0 on the storefront
});
test("search and pills share a row at 1280", async ({ page, fake }) => {
  // one category; 1280 wide: searchbox and the ทั้งหมด pill centres within 12px vertically;
  // searchbox width <= 421; at 390 the pill is below the searchbox
});
test("a product that can't be bought shows a tag and no add button", async ({ page, fake }) => {
  // makeSingle({ purchasable: false, unavailableCodes: ["OUT_OF_STOCK"] }); open store;
  // card shows text "ยังไม่พร้อมขาย"; add button count 0 in that card
});
```

Write the commented tests fully. Update existing storefront tests that asserted `.merchandise-store-status` / `.merchandise-store-opens` / `.merch-preorder` to read the banner instead (same texts, e.g. "เปิดรับ 1 พ.ย. 2026 10:00" and the not-open status message).

- [ ] **Step 2: Run** `storefront.spec.ts` — Expected: the new tests FAIL.

- [ ] **Step 3: Implement**
  - `StoreInfoBanner`: blue `#0055ff` block, white text, radius 20px (16px padding on phones, 24px otherwise), left-aligned. Title (24px/20px phone, 800). Date line: `open && closesAt` → "ปิดรับ {formatMerchandiseTime(closesAt)}"; `not_open && opensAt` → "เปิดรับ {…}"; state not open → `unavailableMessage("STORE_NOT_OPEN", state)`; otherwise none. Then `shippingFeeLabel(store.shippingBaht)`, `shippingInfoTh`, `productionInfoTh`, each its own line when present. Rendered after the banner carousel, before search.
  - `StorefrontClient` `headerSlot`: drop the status/note paragraphs (the banner replaces them); keep `MerchandiseIntentResume`. Persist `canonical` to sessionStorage as in Interfaces.
  - `StorefrontView`: remove `<ShopToolbar />`; catalog heading row = heading left + "คำสั่งซื้อของฉัน" link right when logged in (pass `token` or a `showOrdersLink` prop from the client); remove the truck/shipping text. Search + pills: at ≥1024 one flex row, search `flex: 0 1 420px`, pills wrap in the remaining space.
  - Cards: delete the ≥1280 horizontal override; columns 2/3/4 as today. Body: name (2-line clamp) then a row with price left and the 44×44 round blue-outline icon button right (visible icon, `sr-only` "เพิ่มลงตะกร้า", keep `aria-describedby`). Remove the "พรีออเดอร์" tag; when `!product.purchasable` show a "ยังไม่พร้อมขาย" tag on the image and no button. Missing or failed image → `ProductImagePlaceholder`.
  - Container max width 1200px.

- [ ] **Step 4: Run** `storefront.spec.ts storefront-accessibility.spec.ts storefront-reflow.spec.ts accessibility.spec.ts route-login.spec.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/StoreInfoBanner.tsx src/components/merchandise/StorefrontView.tsx src/components/merchandise/StorefrontClient.tsx src/components/merchandise/storefront-view.css src/components/merchandise/storefront-host.css tests/merchandise/storefront.spec.ts tests/merchandise/storefront-accessibility.spec.ts tests/merchandise/accessibility.spec.ts
git commit -m "feat(merchandise): store info banner and vertical product cards"
```

---

### Task 7: Product detail layout

**Files:**
- Modify: `src/components/merchandise/ProductDetail.tsx`, `product-detail.css`
- Modify: `src/components/merchandise/MerchandiseAuthBoundary.tsx` (`MerchandiseIntentResume` gains `onAdded?: () => void`)
- Test: `tests/merchandise/product-selection.spec.ts`

**Interfaces:**
- Consumes: `ProductImagePlaceholder` (Task 2), `shippingFeeLabel` (Task 1), `sessionStorage["pris_merch_storefront_url"]` (Task 6), `merchandiseReturnPath` (existing).

- [ ] **Step 1: Write failing tests**

```ts
test("at 1024 the title, price and add button sit in the info column", async ({ page, fake }) => {
  const p = makeSingle({ nameTh: "แก้วน้ำ Pris" }); fake.products = [p];
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(`/th/souvenirs/products/${p.id}`);
  const info = (await page.locator(".merch-detail-info").boundingBox())!;
  const title = (await page.getByRole("heading", { level: 1, name: "แก้วน้ำ Pris" }).boundingBox())!;
  expect(title.x).toBeGreaterThanOrEqual(info.x - 1);
  await expect(page.locator(".merch-detail-info").getByRole("button", { name: /^เพิ่มลงตะกร้า/ })).toBeVisible();
  await expect(page.locator(".merch-detail-bar")).toBeHidden();
  await expect(page.locator(".merch-detail-gallery .merch-image-placeholder")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".merch-detail-bar")).toBeVisible();
});
test("production and shipping info are closed disclosures", async ({ page, fake }) => {
  fake.store = makeStore({ productionInfoTh: "ผลิตหลังปิดรับ", shippingInfoTh: "รับที่หน้างาน" });
  const p = makeSingle(); fake.products = [p];
  await page.goto(`/th/souvenirs/products/${p.id}`);
  for (const name of ["การผลิต", "การจัดส่ง"]) {
    const d = page.locator("details", { has: page.getByText(name, { exact: true }) });
    await expect(d).not.toHaveAttribute("open", "");
  }
});
test("a logged-in add shows the added state and a cart link", async ({ page, fake }) => {
  const p = makeSingle(); fake.products = [p]; await login(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(`/th/souvenirs/products/${p.id}`);
  await page.locator(".merch-detail-info").getByRole("button", { name: /^เพิ่มลงตะกร้า/ }).click();
  await expect(page.getByRole("button", { name: "เพิ่มแล้ว ✓" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ดูตะกร้า" })).toHaveAttribute("href", "/th/souvenirs/cart");
});
test("back returns to the filtered storefront", async ({ page, fake }) => {
  const cat = uid(900);
  fake.store = makeStore({ categories: [{ id: cat, nameTh: "เครื่องแต่งกาย", sortOrder: 1 }] });
  const p = makeSingle({ id: uid(1), categoryId: cat }); fake.products = [p];
  await page.goto(`/th/souvenirs?categoryId=${cat}`);
  await page.getByRole("button", { name: `ดูรายละเอียด ${p.nameTh}` }).click();
  await page.getByRole("link", { name: "กลับ" }).click();
  await expect(page).toHaveURL(new RegExp(`/th/souvenirs\\?categoryId=${cat}$`));
});
test("back link ignores an unsafe saved storefront URL", async ({ page, fake }) => {
  const p = makeSingle(); fake.products = [p];
  for (const bad of ["//evil.test/x", "/profile", "https://evil.test"]) {
    await page.addInitScript((v) => sessionStorage.setItem("pris_merch_storefront_url", v), bad);
    await page.goto(`/th/souvenirs/products/${p.id}`);
    await expect(page.getByRole("link", { name: "กลับ" })).toHaveAttribute("href", "/th/souvenirs");
  }
});
```

- [ ] **Step 2: Run** `product-selection.spec.ts -g "info column|disclosures|added state|back"` — Expected: FAIL.

- [ ] **Step 3: Implement**
  - Grid ≥768: `.merch-detail-grid { grid-template-columns: minmax(0,1fr) minmax(0,480px); gap: 40px }`; the `<h1>` moves to the top of `.merch-detail-info`; gallery shows `ProductImagePlaceholder` in a 1:1 box when there are no images.
  - Info column order: h1, price, description, selectors, "จำนวน" label with the stepper left-aligned directly below, add button (≥768 only, full column width, blue, label "เพิ่มลงตะกร้า · {price}" with the same `allowed`/`add` logic as the bar), hint "สินค้าพรีออเดอร์ · {shippingFeeLabel(store.shippingBaht)}", then `<details>` "การผลิต" and "การจัดส่ง" (closed) for `productionInfoTh` / `shippingInfoTh`. Vertical rhythm 16px between blocks, 24px before the disclosures.
  - `.merch-detail-bar` hidden at ≥768.
  - Added state: when `MerchandiseIntentResume` finishes a successful add on this page (add an `onAdded?: () => void` callback prop to it, fired after `accept.current(next)`), show the in-column button as "เพิ่มแล้ว ✓" for 2000 ms, and from then on render a "ดูตะกร้า" link (`/souvenirs/cart`) beside it.
  - Back link: read `sessionStorage["pris_merch_storefront_url"]` after mount (try/catch); use it when `merchandiseReturnPath(value)` returns a path starting with `/souvenirs` and no `/products/` segment, else `/souvenirs`.

- [ ] **Step 4: Run** `product-selection.spec.ts route-login.spec.ts accessibility.spec.ts shell.spec.ts` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/ProductDetail.tsx src/components/merchandise/product-detail.css src/components/merchandise/MerchandiseAuthBoundary.tsx tests/merchandise/product-selection.spec.ts
git commit -m "feat(merchandise): two-column product detail with in-column add button"
```

---

### Task 8: Payment card and order history

**Files:**
- Modify: `src/components/merchandise/OrderScreen.tsx`, `PaymentPanel.tsx`, `PaymentQr.tsx`, `PaidOrder.tsx` (`JustPaidCard` layout only), `order.css`
- Modify: `src/lib/merchandisePayment.ts` (qr_active message), `src/lib/merchandisePayment.test.ts`
- Modify: `src/components/merchandise/OrderHistory.tsx`, `history.css`
- Test: `tests/merchandise/payment-state.spec.ts`, `tests/merchandise/order-history.spec.ts`

- [ ] **Step 1: Update the copy unit test** — the `qr_active` message is `"โอนแล้วระบบจะยืนยันให้อัตโนมัติ"`; run `npx tsx --test src/lib/merchandisePayment.test.ts` — Expected: FAIL; change `merchandisePayment.ts`; run — Expected: PASS.

- [ ] **Step 2: Write failing UI tests**

```ts
// payment-state.spec.ts
test("the pay card is a narrow slip with one instruction and one time line", async ({ page, fake }) => {
  seed(fake); await page.setViewportSize({ width: 1440, height: 1000 }); await open(page);
  const card = page.locator(".merch-pay-card");
  expect((await card.boundingBox())!.width).toBeLessThanOrEqual(440);
  await expect(page.getByRole("heading", { level: 1, name: `คำสั่งซื้อ ${NUMBER}` })).toBeVisible();
  await expect(card.getByText(/กดค้างที่รูป QR/)).toHaveCount(1);
  await expect(card.getByText(/ใช้แอปธนาคาร/)).toHaveCount(0);
  await expect(card.locator(".merch-payment-time")).toHaveText(/^ชำระภายใน \d{2}:\d{2} · หมดอายุ \d{2}:\d{2} น\.$/);
  await expect(card.getByText("โอนแล้วระบบจะยืนยันให้อัตโนมัติ")).toHaveCount(1);
  const logo = (await card.locator(".merch-payment-qr-brand").boundingBox())!, qr = (await card.getByRole("img", { name: /^QR สำหรับ/ }).boundingBox())!;
  expect(logo.y + logo.height).toBeLessThanOrEqual(qr.y + 1);
});
// order-history.spec.ts
test("pending orders offer a pay button and one page hides pagination", async ({ page, fake }) => {
  // seed one pending and one paid order (makeOrder with paymentStatus); login; goto /th/souvenirs/orders
  // pending row: link "ชำระเงิน" href /th/souvenirs/orders/{id}, background rgb(255, 88, 0)
  // paid row: link "ดูรายละเอียด"; nav "หน้าประวัติคำสั่งซื้อ" count 0
});
```

Write the history test fully from its comments. Update existing tests that match the old texts: "เวลาชำระเงินคงเหลือ", "หมดอายุ … (เวลาไทย)", the old qr_active message, and the sr-only `<h1>` (it is now visible).

- [ ] **Step 3: Run** `payment-state.spec.ts order-history.spec.ts` — Expected: new tests FAIL.

- [ ] **Step 4: Implement**
  - `.merch-pay-card { max-width: 440px; margin-inline: auto }`. Inside, in order: logo (40px tall) → visible `<h1>` "คำสั่งซื้อ {orderNumber}" (14px, `#526787`; move it from outside the card into it) → panel title (22px, 800) → amount (32px) → Thai QR brand image `/assets/Img/payment/thai-qr.webp` (class `merch-payment-qr-brand`, 24px tall) → QR → one `<p className="merch-payment-time">` "ชำระภายใน {formatPaymentRemaining(remainingMs)} · หมดอายุ {HH:MM} น." (replaces the countdown and expiry lines; keep `role="timer"`) → hint (`PaymentQr`, unchanged text) → the panel message (for qr_active now the auto-check note), rendered after the QR block → check/request button.
  - `JustPaidCard` uses the same card width and logo → heading order.
  - Order history: rows with `paymentStatus === "pending"` render an orange (`#ff5800`, white 19px bold) link "ชำระเงิน" to the order page instead of "ดูรายละเอียด"; `<time>` 13px `#3b4b66`; render the pagination `<nav>` only when `totalPages > 1`; the history page container becomes 1160px wide (the order list inside may stay at its current max width).

- [ ] **Step 5: Run** `npx tsx --test src/lib/merchandisePayment.test.ts`, `payment-state.spec.ts order-history.spec.ts order-confirmation.spec.ts accessibility.spec.ts` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/merchandise/OrderScreen.tsx src/components/merchandise/PaymentPanel.tsx src/components/merchandise/PaymentQr.tsx src/components/merchandise/PaidOrder.tsx src/components/merchandise/order.css src/lib/merchandisePayment.ts src/lib/merchandisePayment.test.ts src/components/merchandise/OrderHistory.tsx src/components/merchandise/history.css tests/merchandise/payment-state.spec.ts tests/merchandise/order-history.spec.ts
git commit -m "feat(merchandise): slip-sized pay card and a pay button in order history"
```

---

### Task 9: Polish — skeletons, active nav item, text sizes

**Files:**
- Create: `src/components/merchandise/MerchSkeletons.tsx`
- Modify: `StorefrontClient.tsx`, `StorefrontView.tsx`, `CartScreen.tsx`, `OrderScreen.tsx`, `src/app/[locale]/souvenirs/loading.tsx`, `src/components/layout/Header.tsx`, shop CSS files (font sizes)
- Test: `tests/merchandise/shell.spec.ts`, `tests/merchandise/storefront.spec.ts`

**Interfaces:**
- Produces: `ProductGridSkeleton({ count = 8 }: { count?: number })`, `CartSkeleton()`, `OrderCardSkeleton()` — each renders `aria-hidden` shapes plus an `sr-only` `role="status"` text (the old loading text: "กำลังโหลดสินค้า", "กำลังโหลดตะกร้า", "กำลังโหลดคำสั่งซื้อ").

- [ ] **Step 1: Write failing tests**

```ts
// storefront.spec.ts
test("the catalog shows skeleton cards while loading", async ({ page, fake }) => {
  fake.products = [makeSingle()];
  await page.route("**/products?**", async (r) => { await new Promise((f) => setTimeout(f, 1500)); await r.fallback(); });
  await page.goto("/th/souvenirs");
  await expect(page.locator(".merch-skeleton-card").first()).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "กำลังโหลดสินค้า" })).toBeAttached();
  await expect(page.locator(".merch-product")).toHaveCount(1);
});
// shell.spec.ts
test("the souvenir nav item is marked current on shop pages", async ({ page, fake }) => {
  fake.products = [makeSingle()]; await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/th/souvenirs");
  const item = page.locator("header").getByRole("link", { name: "ของที่ระลึก" });
  await expect(item).toHaveAttribute("aria-current", "page");
  await expect(item).toHaveCSS("color", "rgb(0, 85, 255)");
});
test("no shop text is smaller than 13px", async ({ page, fake }) => {
  // visit /th/souvenirs, a product, the cart and the review step (login + seed);
  // on each: every visible element with direct text inside main has computed font-size >= 13
});
```

Write the last test fully from its comment (walk `main *`, keep elements with a non-empty direct text node and a non-zero box).

- [ ] **Step 2: Run** `storefront.spec.ts shell.spec.ts -g "skeleton|current|13px"` — Expected: FAIL.

- [ ] **Step 3: Implement**
  - Skeletons: static `#e9eff8` blocks with radius matching the real component; a shimmer animation only inside `@media (prefers-reduced-motion: no-preference)`. Use `ProductGridSkeleton` where the storefront and catalog showed "กำลังโหลดร้านของที่ระลึก"/"กำลังโหลดสินค้า" (keep that wording as the sr-only status for the store-level load), `CartSkeleton` in `CartLoader`, `OrderCardSkeleton` in `OrderLoader`, and `ProductGridSkeleton` in `souvenirs/loading.tsx`. Error states keep their message and retry button.
  - Header: when `isShop`, the nav item whose `href` is `/souvenirs` gets `aria-current="page"` and color `#0055ff` (desktop nav and mobile sheet).
  - Text sizes: raise every shop CSS `font-size` below 13px to 13px (dates) or 14px (step labels, hints, secondary text).

- [ ] **Step 4: Run** the full merchandise suite on chromium and `npx tsx --test src/lib/merchandise*.test.ts`, `npx tsc --noEmit` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/merchandise/MerchSkeletons.tsx src/components/merchandise/StorefrontClient.tsx src/components/merchandise/StorefrontView.tsx src/components/merchandise/CartScreen.tsx src/components/merchandise/OrderScreen.tsx "src/app/[locale]/souvenirs/loading.tsx" src/components/layout/Header.tsx src/components/merchandise/*.css tests/merchandise/storefront.spec.ts tests/merchandise/shell.spec.ts
git commit -m "feat(merchandise): loading skeletons, current nav item and minimum text size"
```

---

### Task 10: Full verification

- [ ] `npm test` — all unit tests pass.
- [ ] `npx tsc --noEmit` and eslint on touched files — clean.
- [ ] `npx playwright test -c playwright.merchandise.config.ts` (all four projects) — all pass; rerun any single failure once and record it.
- [ ] Manual check in the browser at 390, 768, 1024 and 1440 px: storefront banner and cards, product detail columns, cart/address/review panel, pay card, order history.
