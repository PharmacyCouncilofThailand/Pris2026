# Product image lightbox

## Approved behavior

On the product detail page, clicking or tapping the currently displayed product photo opens a large image viewer over the same page. Support mobile, tablet, and desktop. Keep the full image visible with its original proportions, contained within the available viewport and clear of the controls.

The viewer starts on the image clicked. With multiple images, provide previous/next buttons, horizontal swipes, and a current/total counter. Stop at both ends, as in the existing gallery. Hide navigation and the counter for a single image. Do not add autoplay or a new browser tab.

### Approved follow-up: touch zoom

Two fingers pinch to zoom only the viewer image from 1x to 4x, centered around the fingers. Moving both fingers pans the image with bounded movement. There is no one-finger pan or reset button. As soon as fewer than two fingers remain, or touch is cancelled, return to 1x with zero translation. Ignore the remaining finger until that gesture ends so it cannot navigate or dismiss the viewer. At 1x, a fresh one-finger horizontal swipe continues navigating slides. Changing images or reopening the viewer also resets zoom and translation. Keep the image clipped to its stage so navigation and close controls remain usable. Prevent browser page zoom only over the custom gesture stage; leave browser behavior elsewhere intact.

Close the viewer with its visible X button, a click/tap on the backdrop, or Escape. Clicking the image or navigation must not close it. A swipe must not accidentally open or dismiss the viewer.

## Integration and accessibility

Extend the existing ProductGallery and its merchandise styles. Reuse the installed Base UI Dialog primitives, already used by TemplatePreviewDialog, for modal focus management, keyboard dismissal, backdrop behavior, and background scroll locking. Do not add dependencies or change the API.

Make the product image trigger keyboard accessible with a Thai label describing the action. Give the viewer a dialog title identifying the product, Thai labels for its controls, visible keyboard focus, and controls of at least 44 pixels. Keep focus inside the open viewer and return it to the image trigger after closing.

Use the same current-image index for the inline gallery and viewer, so closing preserves the image last viewed. Opening and navigating do not change the selected product options, price, quantity, or cart. Preserve existing option-led image ordering and reset behavior when the lead image changes.

## Failure handling

Preserve existing failed-image filtering. A placeholder cannot open the viewer. If the active image fails, remove it through the existing callback and return to a valid gallery state. If no images remain, show the existing placeholder with no viewer trigger. Product or option changes that reset the gallery close the viewer safely.

## Verification

Add focused browser checks for opening the clicked image, arrow and swipe navigation, single-image navigation visibility, X/backdrop/Escape dismissal, focus containment and restoration, preventing swipe-to-open, unchanged quantity, and failed-image fallback. Check layout and image containment at mobile, tablet, and desktop widths in Chromium and WebKit emulation. Run relevant existing gallery/selection checks, TypeScript, targeted lint, formatting, and whitespace checks.

## Scope

Only the product detail image viewer changes. Existing inline carousel behavior, storefront filters, and product description headings remain intact. This extends the earlier carousel design's scope to include the now-approved image viewer.
