"use client";
import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { CartLine, LineSelection } from "@/types/merchandise";
import { cartIssueMessage, cartLineOptions } from "@/lib/merchandiseCart";
import { formatMinorBaht } from "@/lib/merchandiseFormat";
import {
  initialSelection,
  parseQuantity,
  selectionReady,
  variantLabel,
} from "@/lib/merchandiseSelection";
import VariantSelector from "./VariantSelector";
import BundleSelector from "./BundleSelector";
export default function CartRow({
  line,
  busy,
  onUpdate,
  onRemove,
  priceChange,
}: {
  line: CartLine;
  busy: boolean;
  onUpdate(quantity: number, selection?: LineSelection): void;
  onRemove(): void;
  priceChange?: { from: string; to: string };
}) {
  const product = line.product,
    image = product?.images[0];
  const name = product?.nameTh ?? "สินค้าที่ไม่พร้อมแสดง";
  const [quantity, setQuantity] = useState(String(line.quantity));
  const [selection, setSelection] = useState<LineSelection>(() => ({
    productId: line.productId,
    variantId: line.variantId,
    bundleSelections: [
      ...(product
        ? initialSelection(product).bundleSelections.filter(
            (c) =>
              !line.bundleSelections.some(
                (s) => s.componentId === c.componentId,
              ),
          )
        : []),
      ...line.bundleSelections,
    ],
  }));
  const count = parseQuantity(quantity);
  const editOptions =
    product &&
    (product.kind === "bundle"
      ? product.components.some((c) => c.optionMode === "selectable")
      : product.optionMode !== "none");
  const saveOptions = () => {
    if (!product || !selectionReady(product, selection)) return;
    onUpdate(line.quantity, {
      ...selection,
      bundleSelections: selection.bundleSelections.filter((s) =>
        product.components.some(
          (c) => c.id === s.componentId && c.optionMode === "selectable",
        ),
      ),
    });
  };
  return (
    <article
      className={`merch-cart-row${line.valid ? "" : " merch-cart-row-invalid"}`}
      aria-label={name}
    >
      <div className="merch-cart-row-main">
        {image && (
          <Image
            className="merch-cart-image"
            unoptimized
            src={image.url}
            alt={image.altTh}
            width={80}
            height={92}
          />
        )}
        <div className="merch-cart-row-detail">
          <h2>
            <Link href={`/souvenirs/products/${line.productId}`}>{name}</Link>
          </h2>
          <p className="merch-cart-muted">{cartLineOptions(line)}</p>
          <p className="merch-cart-unit-price">
            {line.unitPriceMinor === null
              ? "—"
              : formatMinorBaht(line.unitPriceMinor)}
            <small> / {product?.kind === "bundle" ? "ชุด" : "ชิ้น"}</small>
          </p>
          {priceChange && (
            <p className="merch-cart-notice">
              ราคาปรับจาก {formatMinorBaht(priceChange.from)} เป็น{" "}
              {formatMinorBaht(priceChange.to)} กรุณาตรวจสอบอีกครั้ง
            </p>
          )}
          {product?.kind === "bundle" && (
            <ul
              className="merch-cart-components"
              aria-label="ส่วนประกอบต่อหนึ่งชุด"
            >
              {product.components.map((c) => {
                const id =
                  c.optionMode === "fixed"
                    ? c.fixedVariantId
                    : line.bundleSelections.find((s) => s.componentId === c.id)
                        ?.variantId;
                const variant = c.allowedVariants.find((v) => v.id === id);
                return (
                  <li key={c.id}>
                    {c.nameTh} × {c.quantityPerBundle} ·{" "}
                    {variant
                      ? variantLabel(variant)
                      : "ตัวเลือกเดิมไม่พร้อมขาย"}
                  </li>
                );
              })}
            </ul>
          )}
          <form
            className="merch-cart-row-actions"
            onSubmit={(e) => {
              e.preventDefault();
              if (count !== null && line.valid) onUpdate(count);
            }}
          >
            <div className="merch-cart-stepper">
              <button
                type="button"
                aria-label={`ลดจำนวน ${name}`}
                disabled={busy || !line.valid || count === null || count <= 1}
                onClick={() => onUpdate(count! - 1)}
              >
                <Minus size={18} aria-hidden="true" />
              </button>
              <label className="merch-sr-only" htmlFor={`quantity-${line.id}`}>
                จำนวน {name}
              </label>
              <input
                id={`quantity-${line.id}`}
                type="text"
                inputMode="numeric"
                value={quantity}
                aria-invalid={count === null}
                disabled={busy || !line.valid}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button
                type="button"
                aria-label={`เพิ่มจำนวน ${name}`}
                disabled={
                  busy ||
                  !line.valid ||
                  count === null ||
                  count === Number.MAX_SAFE_INTEGER
                }
                onClick={() => onUpdate(count! + 1)}
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
            <button
              className="merch-cart-delete"
              type="button"
              disabled={busy}
              aria-label={`ลบ ${name}`}
              onClick={onRemove}
            >
              <Trash2 size={20} aria-hidden="true" />
            </button>
            {quantity !== String(line.quantity) && (
              <button
                className="merch-cart-secondary"
                type="submit"
                disabled={busy || count === null || !line.valid}
              >
                บันทึกจำนวน
              </button>
            )}
          </form>
          {count === null && (
            <p role="alert">กรุณาระบุจำนวนเต็มตั้งแต่ 1 ขึ้นไป</p>
          )}
          <p className="merch-cart-line-total">
            รวมรายการ:{" "}
            {line.lineTotalMinor === null
              ? "ยังสรุปยอดไม่ได้"
              : formatMinorBaht(line.lineTotalMinor)}
          </p>
          {!line.valid && (
            <p className="merch-cart-issue">
              {cartIssueMessage(line.issueCodes)}
            </p>
          )}
          {editOptions && (
            <details className="merch-cart-edit">
              <summary>เปลี่ยนตัวเลือก</summary>
              {product.kind === "bundle" ? (
                <BundleSelector
                  product={product}
                  selection={selection}
                  onChange={setSelection}
                  disabled={busy}
                />
              ) : (
                <VariantSelector
                  variants={product.variants}
                  selectedId={selection.variantId}
                  onChange={(variantId) =>
                    setSelection((s) => ({ ...s, variantId }))
                  }
                  disabled={busy}
                />
              )}
              <button
                className="merch-cart-secondary"
                type="button"
                disabled={busy || !selectionReady(product, selection)}
                onClick={saveOptions}
              >
                บันทึกตัวเลือก
              </button>
            </details>
          )}
          {!line.valid && (
            <Link
              className="merch-cart-secondary"
              href={`/souvenirs/products/${line.productId}`}
            >
              ดูตัวเลือกสินค้า
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
