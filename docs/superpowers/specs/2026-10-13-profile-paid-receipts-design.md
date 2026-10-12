# PRIS signup email label and paid receipt visibility

The user approved using the paid order total greater than zero to control profile payment documents, while retaining the unavailable-document state for people who have paid.

## Scope

- Thai signup email labels display `อีเมล`. Remove the email label's visual asterisk while preserving the native `required` validation in all signup forms, including the shared special-role form. The shared Thai `auth.emailAddress` translation also changes in forgot-password, keeping the wording consistent.
- Keep `/api/payments/my-tickets` and all existing fields compatible. Add nullable decimal-string `paidAmount`, populated from `orders.totalAmount` only for orders with status `paid`. The existing `amount` remains the ticket list price.
- Profile selects a positive finite `paidAmount` for the configured event, searching past zero-value registrations. Hide the entire payment-documents section while loading, on failure, for missing/unpaid orders, or for zero-value orders including 100% promotions. Paid users retain the existing ready/unavailable receipt UI. Reset receipt state when the auth token changes and ignore responses after effect cleanup.

## Checks and exclusions

Test the actual ticket endpoint response with controlled database results and the actual profile component with mocked auth/network dependencies. Include positive paid orders, zero-value orders, 100% discounts on priced tickets, manual registrations without orders, pending orders, multiple registrations/events, unavailable documents, and loading/error states. Check translations, required email validation, TypeScript, formatting and diff. No database migration, historical data cleanup, receipt issuance changes, or deployment.
