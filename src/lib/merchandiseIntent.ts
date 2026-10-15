import type { CartDto, LineSelection, ProductDto } from "../types/merchandise";
import {
  MerchandiseApiError,
  merchandiseFailure,
  type MerchandiseApi,
} from "./merchandiseApi";
import { isMerchandiseId, merchandiseReturnPath } from "./merchandiseRoutes";
const KEY = "pris_merchandise_intent";
export interface PurchaseIntent {
  id: string;
  eventCode: string;
  returnPath: string;
  selection: LineSelection;
  quantity: number;
  // Identity and original CAS only: never token, price, address or email.
  buyerId?: number;
  expectedRevision?: number;
}
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const keys = (v: Record<string, unknown>, allowed: string[]) =>
  Object.keys(v).every((k) => allowed.includes(k));
const positive = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v > 0;
function valid(v: unknown): v is PurchaseIntent {
  if (
    !object(v) ||
    !keys(v, [
      "id",
      "eventCode",
      "returnPath",
      "selection",
      "quantity",
      "buyerId",
      "expectedRevision",
    ]) ||
    !isMerchandiseId(v.id) ||
    typeof v.eventCode !== "string" ||
    !/^[A-Za-z0-9_-]{1,50}$/.test(v.eventCode) ||
    !positive(v.quantity) ||
    typeof v.returnPath !== "string"
  )
    return false;
  const path = merchandiseReturnPath(v.returnPath);
  if (
    !path ||
    ![
      "/souvenirs",
      `/souvenirs/products/${object(v.selection) ? v.selection.productId : ""}`,
    ].includes(path.split("?")[0])
  )
    return false;
  const intentId = new URL(path, "https://internal.invalid").searchParams.get(
    "intentId",
  );
  if (intentId !== null && intentId !== v.id) return false;
  if (v.buyerId !== undefined && !positive(v.buyerId)) return false;
  if (
    v.expectedRevision !== undefined &&
    (!positive(v.buyerId) ||
      typeof v.expectedRevision !== "number" ||
      !Number.isSafeInteger(v.expectedRevision) ||
      v.expectedRevision < 0)
  )
    return false;
  const s = v.selection;
  return (
    object(s) &&
    keys(s, ["productId", "variantId", "bundleSelections"]) &&
    isMerchandiseId(s.productId) &&
    (s.variantId === null || isMerchandiseId(s.variantId)) &&
    Array.isArray(s.bundleSelections) &&
    s.bundleSelections.every(
      (c) =>
        object(c) &&
        keys(c, ["componentId", "variantId"]) &&
        isMerchandiseId(c.componentId) &&
        isMerchandiseId(c.variantId),
    ) &&
    new Set(s.bundleSelections.map((c) => c.componentId)).size ===
      s.bundleSelections.length
  );
}
export function writePurchaseIntent(
  storage: Storage,
  intent: PurchaseIntent,
): void {
  if (!valid(intent)) throw merchandiseFailure(422, "MERCH_INVALID_INTENT");
  try {
    storage.setItem(KEY, JSON.stringify(intent));
  } catch {
    throw merchandiseFailure(0, "MERCH_INTENT_STORAGE_UNAVAILABLE");
  }
}
export function clearPurchaseIntent(
  storage: Storage,
  expectedId?: string,
): void {
  try {
    if (
      expectedId &&
      JSON.parse(storage.getItem(KEY) ?? "null")?.id !== expectedId
    )
      return;
    storage.removeItem(KEY);
  } catch {
    /* A denied storage operation must never authorize a mutation. */
  }
}
export function readPurchaseIntent(
  storage: Storage,
  eventCode: string,
): PurchaseIntent | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(KEY) ?? "null");
    if (valid(value) && value.eventCode === eventCode) return value;
    clearPurchaseIntent(storage);
  } catch {
    clearPurchaseIntent(storage);
  }
  return null;
}
export function clearForeignPurchaseIntent(
  storage: Storage,
  buyerId: number | null,
): void {
  try {
    const intent: unknown = JSON.parse(storage.getItem(KEY) ?? "null");
    if (
      !valid(intent) ||
      (intent.buyerId !== undefined && intent.buyerId !== buyerId)
    )
      clearPurchaseIntent(storage);
  } catch {
    clearPurchaseIntent(storage);
  }
}
export function purchaseIntentReturnPath(intent: PurchaseIntent): string {
  if (!valid(intent)) throw merchandiseFailure(422, "MERCH_INVALID_INTENT");
  const url = new URL(
    merchandiseReturnPath(intent.returnPath)!,
    "https://internal.invalid",
  );
  url.searchParams.set("intentId", intent.id);
  return merchandiseReturnPath(url.pathname + url.search)!;
}
// Missing selectable options go to the P06 selector, never a substitute SKU.
export function resolveIntentSelection(
  product: ProductDto,
  selection: LineSelection,
): LineSelection | null {
  if (!product.purchasable || product.id !== selection.productId) return null;
  if (product.kind === "single") {
    if (selection.bundleSelections.length) return null;
    const defaults = product.variants.filter((v) => v.isDefault);
    const variantId =
      selection.variantId ??
      (product.optionMode === "none" && defaults.length === 1
        ? defaults[0].id
        : null);
    if (!variantId) return null;
    return product.variants.some(
      (v) =>
        v.id === variantId && v.saleEnabled && v.effectivePriceMinor !== null,
    )
      ? { ...selection, variantId }
      : null;
  }
  if (
    selection.variantId !== null ||
    selection.bundleSelections.some(
      (s) => !product.components.some((c) => c.id === s.componentId),
    )
  )
    return null;
  const choices = [];
  for (const component of product.components) {
    const selected = selection.bundleSelections.find(
      (c) => c.componentId === component.id,
    )?.variantId;
    const variantId =
      selected ??
      (component.optionMode === "fixed" ? component.fixedVariantId : null);
    if (
      !variantId ||
      (component.optionMode === "fixed"
        ? variantId !== component.fixedVariantId
        : !component.allowedVariants.some(
            (v) => v.id === variantId && v.saleEnabled,
          ))
    )
      return null;
    choices.push({ componentId: component.id, variantId });
  }
  return { ...selection, bundleSelections: choices };
}
export type IntentResult =
  | { kind: "none" }
  | { kind: "cancelled" }
  | { kind: "needs_selection"; path: string }
  | { kind: "added"; cart: CartDto; intentId: string }
  | { kind: "error"; error: Error; uncertain: boolean };
interface ResumeOptions {
  storage: Storage;
  api: MerchandiseApi;
  eventCode: string;
  token: string;
  buyerId: number;
  isCurrent: () => boolean;
}
const pending = new WeakMap<
  Storage,
  Map<string, { token: string; promise: Promise<IntentResult> }>
>();
export function resumePurchaseIntent(
  options: ResumeOptions,
): Promise<IntentResult> {
  const { storage, eventCode, buyerId, token } = options,
    intent = readPurchaseIntent(storage, eventCode);
  if (!intent || !token || !positive(buyerId))
    return Promise.resolve({ kind: "none" });
  if (intent.buyerId !== undefined && intent.buyerId !== buyerId) {
    clearPurchaseIntent(storage, intent.id);
    return Promise.resolve({ kind: "cancelled" });
  }
  const map = pending.get(storage) ?? new Map();
  pending.set(storage, map);
  const key = `${eventCode}:${buyerId}:${intent.id}`,
    existing = map.get(key);
  if (existing?.token === token) return existing.promise;
  const promise = run(options, intent).finally(() => {
    if (map.get(key)?.promise === promise) map.delete(key);
  });
  map.set(key, { token, promise });
  return promise;
}
async function run(
  { storage, api, eventCode, token, buyerId, isCurrent }: ResumeOptions,
  intent: PurchaseIntent,
): Promise<IntentResult> {
  let observed = JSON.stringify(intent);
  let posting = false;
  const current = () =>
    isCurrent() &&
    JSON.stringify(readPurchaseIntent(storage, eventCode)) === observed;
  const persist = (value: PurchaseIntent) => {
    writePurchaseIntent(storage, value);
    observed = JSON.stringify(value);
  };
  try {
    if (!current()) return { kind: "cancelled" };
    persist({ ...intent, buyerId });
    const store = await api.store(eventCode);
    if (!current()) return { kind: "cancelled" };
    let draft = { ...intent, buyerId };
    if (intent.expectedRevision === undefined) {
      if (store.state !== "open")
        throw merchandiseFailure(409, "MERCH_STORE_CLOSED");
      const product = await api.product(eventCode, intent.selection.productId);
      if (!current()) return { kind: "cancelled" };
      if (product.eventId !== store.eventId)
        throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
      const selection = resolveIntentSelection(product, intent.selection);
      if (!selection)
        return {
          kind: "needs_selection",
          path: purchaseIntentReturnPath({
            ...intent,
            returnPath: `/souvenirs/products/${intent.selection.productId}`,
          }),
        };
      // Fixed components are resolved/displayed in the UI, but the canonical
      // backend contract accepts buyer choices only. It derives fixed BOM rows
      // itself. Persist this exact wire selection before the first POST so an
      // unknown reply replays the same key/body without re-reading a changed set.
      draft = {
        ...draft,
        selection:
          product.kind === "bundle"
            ? {
                ...selection,
                bundleSelections: selection.bundleSelections.filter((s) =>
                  product.components.some(
                    (c) =>
                      c.id === s.componentId && c.optionMode === "selectable",
                  ),
                ),
              }
            : selection,
      };
    }
    const cart = await api.cart(eventCode, token);
    if (!current()) return { kind: "cancelled" };
    if (cart.eventId !== store.eventId)
      throw merchandiseFailure(0, "MERCH_BAD_RESPONSE");
    draft = {
      ...draft,
      expectedRevision: intent.expectedRevision ?? cart.revision,
    };
    persist(draft);
    // Persist before POST: a lost reply must replay this exact body and key.
    posting = true;
    const added = await api.add(
      eventCode,
      token,
      {
        ...draft.selection,
        quantity: draft.quantity,
        expectedRevision: draft.expectedRevision!,
      },
      `intent:${draft.id}`,
    );
    if (!current()) return { kind: "cancelled" };
    if (added.eventId !== store.eventId)
      throw merchandiseFailure(0, "MERCH_BAD_RESPONSE", true);
    clearPurchaseIntent(storage, intent.id);
    return { kind: "added", cart: added, intentId: intent.id };
  } catch (error) {
    if (!isCurrent()) return { kind: "cancelled" };
    return {
      kind: "error",
      error: error instanceof Error ? error : merchandiseFailure(),
      uncertain:
        (object(error) && error.uncertain === true) ||
        (intent.expectedRevision !== undefined &&
          !(
            posting &&
            error instanceof MerchandiseApiError &&
            [409, 422].includes(error.status)
          )),
    };
  }
}
