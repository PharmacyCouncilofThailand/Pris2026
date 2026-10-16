import { clearForeignCheckouts } from "./merchandiseCheckoutKey";
import { clearPurchaseIntent } from "./merchandiseIntent";

/**
 * Storage hygiene when the signed-in buyer changes.
 * - A different owner, or an explicit logout, drops the pending add-to-cart intent.
 *   A token that merely expired keeps it so the buyer's re-login still finds it.
 * - A signed-in buyer never keeps another buyer's checkout key or recipient draft.
 */
export function applyOwnerChange(
  storage: Storage,
  before: number | null | undefined,
  buyerId: number | null,
  loggedOut: boolean,
): void {
  if (
    before !== undefined &&
    before !== null &&
    before !== buyerId &&
    (buyerId !== null || loggedOut)
  )
    clearPurchaseIntent(storage);
  if (buyerId !== null) clearForeignCheckouts(storage, buyerId);
}
