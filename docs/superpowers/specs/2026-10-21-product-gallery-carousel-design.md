# Product detail image carousel

## Approved direction

Replace the vertically stacked product photos on `/[locale]/souvenirs/products/[productId]` with one square image frame. Show one complete image at a time using `object-fit: contain`, preserving the current rounded corners and preorder badge. The frame scales to its column on desktop and the available width on mobile; additional images do not increase page height.

## Interaction

- Multiple images: support horizontal touch swipes, previous/next buttons, and a current/total counter such as `1/3` inside the frame. Do not autoplay or add thumbnails.
- Stop at the first and last images; disable the corresponding arrow. Keep vertical page scrolling available during touch interaction.
- One image: hide navigation buttons and the counter.
- Give navigation buttons Thai accessible labels, visible keyboard focus, and touch targets of at least 44 pixels. Support keyboard activation through native buttons and announce the current image position politely.

## Existing product behavior

Keep the current option-led image ordering from `leadImageFirst`. When selecting an option changes the lead image, return the carousel to the first image so the selected option is visible. Changing slides must not change the selected variant, quantity, price, or cart behavior. Preserve saved gallery order when an option has no valid image.

## Implementation boundary and failures

The product detail route and API stay as they are. ProductDetail continues to own option selection, preview ordering, and failed image filtering. Keep carousel presentation and navigation in a focused gallery component using existing React and styling patterns, without adding dependencies.

If an image fails, remove it using the existing failed-image handling. Ensure the active position remains valid when the list changes. If every image fails or there are no images, show the existing placeholder and hide navigation. Keep the preorder badge visible while browsing valid images.

## Validation

Verify desktop buttons, mobile swipes, first/last boundaries, counter updates, single-image and empty states, image failure, and option-driven reset. Confirm the frame stays the same size across image dimensions and that the page has no horizontal overflow. Run existing merchandise checks covering option images, ordering, and purchase behavior, plus focused gallery interaction checks and relevant lint/type checks.

## Scope

Only the product detail gallery changes. No zoom dialog, fullscreen viewer, autoplay, thumbnails, API changes, or storefront redesign.
