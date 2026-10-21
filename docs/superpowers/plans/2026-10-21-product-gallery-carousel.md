# Product Gallery Carousel Implementation Plan

> Execute inline in this session, with focused checks after each task.

**Goal:** Show product images in one swipeable frame on mobile, tablet, and desktop.

**Architecture:** ProductDetail retains image filtering and option-led ordering. A ProductGallery component owns only slide navigation and renders the current image. Reset its React key when the lead or ordered image IDs change.

**Tech Stack:** React 19, Next Image, TypeScript, existing CSS, Playwright.

## Global Constraints

- One square frame, complete image, no thumbnails or autoplay.
- Stop at boundaries; hide navigation for zero or one image.
- Preserve option selection, purchase behavior, preorder badge, and image failure fallback.
- Buttons have Thai labels, visible focus, and 44px targets. Announce position politely.
- Support horizontal touch swipes while allowing vertical scrolling.
- No added dependencies or API changes.

### Task 1: Add interaction regression coverage

**File:** `tests/merchandise/product-gallery.spec.ts`

- [x] Create tests using existing fake API and image stubs, asserting exactly one displayed image, next/previous boundaries, counter, unchanged quantity, single/empty/failed states, and option reset.
- [x] Run `npx playwright test -c playwright.merchandise.config.ts product-gallery.spec.ts --project=chromium`. Expect missing navigation failures before implementation.
- [x] Include viewport cases 390x844, 820x1180, 1440x900, verifying square bounds, stable height, no document overflow, and horizontal swipe events. Verify vertical gestures leave the image unchanged.

### Task 2: Implement the gallery and integrate it

**Create:** `src/components/merchandise/ProductGallery.tsx`
**Modify:** `src/components/merchandise/ProductDetail.tsx`, `src/components/merchandise/product-detail.css`

**Interface:** `ProductGallery({ images, name, failed, onImageError }: { images: ImageAsset[]; name: string; failed: boolean; onImageError: (id: string) => void })`.

- [x] Store `index` with `useState(0)`; navigation clamps using `Math.max(0, Math.min(images.length - 1, current + delta))`.
- [x] Keep touch start coordinates in a ref. On touch end, navigate only when horizontal displacement exceeds 40px and exceeds vertical displacement; clear on cancellation. Use `touch-action: pan-y pinch-zoom`.
- [x] Render one keyed Next Image inside a square figure, existing preorder caption, conditional arrows, and polite counter. Return the existing placeholder when empty.
- [x] Replace ProductDetail's mapped figures with ProductGallery keyed by `JSON.stringify([leadId, shownImages.map(image => image.id)])`. Continue passing failures into `setFailedImages`.
- [x] Set gallery `min-width: 0`; figure `aspect-ratio: 1; overflow: hidden`; image `width: 100%; height: 100%; object-fit: contain`. Position arrows at the vertical midpoint and counter bottom right. Give arrows 44px minimum dimensions and focus outlines.

### Task 3: Verify and review

- [x] Run focused gallery and existing product-selection browser tests on Chromium and WebKit, including mobile projects.
- [x] Run `npm run test:merchandise`, targeted ESLint, `npx tsc --noEmit`, and `git diff --check`.
- [x] Review responsive screenshots and the final diff. Record outcomes and any unavailable checks; update this checklist.


## Validation results

- Browser coverage: 132 cases verified across desktop Chromium, desktop WebKit, Pixel 7, and iPhone 14 emulation (96 existing purchase/selection cases and 36 gallery cases).
- The first full run passed 126 cases; six Chromium gesture tests failed because synthetic Touch objects omitted the required identifier. Added identifier: 0 and reran all six successfully. No production changes were needed for that fixture correction.
- The configured test server initially could not acquire the active dev server lock. Used the existing server at http://127.0.0.1:3000 with all merchandise API requests intercepted at http://localhost:3002.
- Merchandise unit tests: 99 passed. TypeScript, targeted ESLint, formatting checks, and diff whitespace checks passed.
- Reviewed screenshots at 390, 820, and 1440 pixels. Frame size stayed stable across differently sized image metadata; no document overflow.
- A separate attempt to open the supplied real product could not reach a rendered gallery within 30 seconds. Visual checks used stubbed product data and images; physical devices were not tested.
- Reviewed the final component, integration, and CSS diff. No additional dependencies were introduced.
