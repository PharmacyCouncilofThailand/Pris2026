import type { CartDto } from "../types/merchandise";
import type { MerchandiseApi } from "./merchandiseApi";
import { isMerchandiseId, merchandiseReturnPath } from "./merchandiseRoutes";
import type { Selection } from "./merchandiseSelection";

const KEY = "pris_merchandise_intent";

export interface PurchaseIntent {
  id: string;
  eventCode: string;
  returnPath: string;
  productId: string;
  selection: Selection;
  quantity: number;
}

const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function valid(v: unknown): v is PurchaseIntent {
  if (
    !object(v) ||
    !isMerchandiseId(v.id) ||
    !isMerchandiseId(v.productId) ||
    typeof v.eventCode !== "string" ||
    !/^[A-Za-z0-9_-]{1,50}$/.test(v.eventCode) ||
    typeof v.quantity !== "number" ||
    !Number.isSafeInteger(v.quantity) ||
    v.quantity < 1 ||
    typeof v.returnPath !== "string"
  )
    return false;
  const path = merchandiseReturnPath(v.returnPath);
  if (
    !path ||
    !["/souvenirs", `/souvenirs/products/${v.productId.toLowerCase()}`].includes(
      path.split("?")[0],
    )
  )
    return false;
  const intentId = new URL(path, "https://internal.invalid").searchParams.get(
    "intentId",
  );
  if (intentId !== null && intentId !== v.id.toLowerCase()) return false;
  const s = v.selection;
  return (
    object(s) &&
    (s.variantId === null || isMerchandiseId(s.variantId)) &&
    Array.isArray(s.bundleSelections) &&
    s.bundleSelections.every(
      (c) =>
        object(c) &&
        isMerchandiseId(c.componentId) &&
        isMerchandiseId(c.variantId),
    ) &&
    new Set(s.bundleSelections.map((c) => c.componentId)).size ===
      s.bundleSelections.length
  );
}

export function savePurchaseIntent(
  storage: Storage,
  intent: PurchaseIntent,
): void {
  if (!valid(intent)) throw new Error("Invalid purchase intent");
  storage.setItem(KEY, JSON.stringify(intent));
}

export function clearPurchaseIntent(storage: Storage): void {
  try {
    storage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function readPurchaseIntent(
  storage: Storage,
  id: string,
): PurchaseIntent | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(KEY) ?? "null");
    if (valid(value) && value.id === id) return value;
  } catch {
    /* corrupt */
  }
  return null;
}

/** Adds the intent to the cart exactly once; the intent is cleared on success and on any rejection. */
export async function resumePurchaseIntent(
  api: Pick<MerchandiseApi, "addCartItem">,
  token: string,
  intent: PurchaseIntent,
  storage: Storage = sessionStorage,
  signal?: AbortSignal,
): Promise<CartDto> {
  try {
    return await api.addCartItem(
      intent.eventCode,
      token,
      {
        productId: intent.productId,
        variantId: intent.selection.variantId,
        bundleSelections: intent.selection.bundleSelections,
        quantity: intent.quantity,
      },
      signal,
    );
  } finally {
    clearPurchaseIntent(storage);
  }
}
