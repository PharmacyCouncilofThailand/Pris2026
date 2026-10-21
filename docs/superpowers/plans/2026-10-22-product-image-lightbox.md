# Product Image Lightbox Implementation Plan

**Goal:** Open the current product photo in an accessible modal viewer across mobile, tablet, and desktop.

**Architecture:** Extend ProductGallery with a controlled Base UI Dialog using the existing image index and failure callback. Keep modal styles in product-detail.css. No dependencies or API changes.

## Tasks (execute inline)

- [x] Extend `src/components/merchandise/ProductGallery.tsx`: use `Dialog.Root`, `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`, `Dialog.Title`, and `Dialog.Close`; add an accessible image button; share current index, navigation, and touch gesture handlers between inline frame and viewer. Suppress the click after any drag. Preserve focus restoration and hide navigation for a single image.
- [x] Extend `src/components/merchandise/product-detail.css`: clickable full-size image trigger with focus outline; dark modal backdrop; viewport-contained viewer image; separate 44px close/previous/next controls; counter; safe-area-aware spacing on phones.
- [x] Add `tests/merchandise/product-lightbox.spec.ts`: opening current slide, navigation and counter, unchanged quantity after close, close button/backdrop/Escape, focus trap/restoration, horizontal swipe, drag suppression, single image, failed image, responsive image bounds at 390/820/1440px.
- [x] Update existing single-image gallery assertion to allow the newly introduced image trigger while continuing to assert no navigation.
- [x] Run focused lightbox and gallery browser tests across desktop/mobile Chromium and WebKit, then option-image selection regressions. Run TypeScript, targeted ESLint, formatting, and whitespace checks. Inspect responsive screenshots and final diff.

## Acceptance

All behavior in `docs/superpowers/specs/2026-10-22-product-image-lightbox-design.md` is covered by the implementation and focused checks. Existing option ordering, cart behavior, storefront filters, and description heading remain intact. Physical-device testing is outside available automated checks.

## Validation results

- Initial gallery/lightbox run: 56 passed across desktop Chromium, desktop WebKit, Pixel 7, and iPhone 14 emulation.
- Strengthened the responsive image fixture to serve a real 300x900 SVG and assert both image proportions and use of available height. Reran the full lightbox checks plus existing option-image selection regressions: 40 passed.
- TypeScript, targeted ESLint, Prettier, and whitespace checks passed.
- Inspected the mobile lightbox screenshot with the portrait fixture: image and controls remain within the viewport. Bounds assertions also cover 820px and 1440px widths.
- Reviewed component and CSS changes. Uses the existing Base UI dependency; no API or purchase changes. Physical devices were not tested.

## Follow-up: image-only pinch zoom

User approved adding two-finger image zoom and panning inside the viewer.

- [x] Extract ProductLightboxImage to own pinch/pan/swipe gestures and bounded 1x–4x transforms. Share the click-suppression ref across slide resets so swipes cannot dismiss the newly mounted image.
- [x] Keep controls outside the clipped image area, provide a reset button, and reset transform when changing images or reopening the modal. Disable native browser gestures only on the image stage.
- [x] Add zoom range, pan bounds, pinch-to-pan finger transitions, no accidental navigation/dismissal, reset, and native Chromium mobile touch tests.
- [x] Run existing lightbox regressions and new gesture checks: 29 passed, 3 platform-specific native-CDP tests skipped outside mobile Chromium. The native mobile Chromium pinch test passed and browser viewport scale remained 1.
- [x] TypeScript, targeted ESLint, formatting, and whitespace checks passed. Physical Android/iOS devices were not tested.

## Revised touch interaction

Supersedes the earlier persistent zoom/reset-button behavior at the user's request.

- [x] Remove the reset button and one-finger panning.
- [x] Use the two-finger midpoint for panning while pinching, with existing 1x–4x bounds.
- [x] Restore original scale and position when fewer than two fingers remain or touch is cancelled; suppress residual one-finger navigation/dismissal.
- [x] Update automated coverage for two-finger panning, partial release, full release, cancellation, and native mobile Chromium auto-reset. TypeScript, lint, and whitespace checks passed.
