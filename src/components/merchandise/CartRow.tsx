"use client";
import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import type {
  CartItemPatch,
  CartLine,
  StoreDto,
  VariantDto,
} from "@/types/merchandise";
import { formatBaht } from "@/lib/merchandiseFormat";
import {
  describeLine,
  parseQuantity,
  selectionComplete,
  unavailableMessage,
  variantLabel,
  type Selection,
} from "@/lib/merchandiseSelection";
import VariantSelector from "./VariantSelector";
import BundleSelector from "./BundleSelector";

const MAX_QUANTITY = 9999;

export default function CartRow({
  line,
  storeState,
  busy,
  onUpdate,
  onRemove,
  priceChange,
}: {
  line: CartLine;
  storeState: StoreDto["state"];
  busy: boolean;
  onUpdate(patch: CartItemPatch): void;
  onRemove(): void;
  priceChange?: { from: number; to: number };
}) {
  const product = line.product,
    image = product?.images[0];
  const name = product?.nameTh ?? "สินค้าที่ไม่พร้อมแสดง";
  const [quantity, setQuantity] = useState(String(line.quantity));
  const [imageFailed, setImageFailed] = useState(false),
    [editing, setEditing] = useState(false);
  const [selection, setSelection] = useState<Selection>(() => ({
    variantId: line.variantId,
    bundleSelections: line.bundleSelections,
  }));
  const parsed = parseQuantity(quantity),
    count = parsed !== null && parsed <= MAX_QUANTITY ? parsed : null;
  const editOptions =
    product &&
    (product.kind === "bundle"
      ? product.components.some((c) => c.mode === "selectable")
      : product.hasOptions);
  const saveOptions = () => {
    if (!product || !selectionComplete(product, selection)) return;
    onUpdate(
      product.kind === "bundle"
        ? { bundleSelections: selection.bundleSelections }
        : { variantId: selection.variantId },
    );
  };
  const issues = line.valid
    ? []
    : [
        ...new Set(
          (product === null
            ? ["PRODUCT_MISSING"]
            : line.issueCodes.length
              ? line.issueCodes
              : ["UNKNOWN"]
          ).map((code) => unavailableMessage(code, storeState)),
        ),
      ];
  const options =
    product?.kind === "single"
      ? describeLine(line)
      : product?.kind === "bundle"
        ? `ชุด ${product.components.length} รายการ`
        : "";
  const formId = `cart-form-${line.id}`,
    editId = `cart-edit-${line.id}`;
  const unitWord = product?.kind === "bundle" ? "ชุด" : "ชิ้น";
  return (
    <article
      className={`merch-cart-row${line.valid ? "" : " merch-cart-row-invalid"}`}
      aria-label={name}
    >
      <div className="merch-cart-row-main">
        <div className="merch-cart-image-cell">
          {image && !imageFailed ? (
            <Image
              className="merch-cart-image"
              unoptimized
              src={image.url}
              alt={name}
              width={80}
              height={80}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <ProductImagePlaceholder failed={imageFailed} />
          )}
        </div>
        <div className="merch-cart-row-detail">
          <h2>
            {product ? (
              <Link href={`/souvenirs/products/${line.productId}`}>{name}</Link>
            ) : (
              name
            )}
          </h2>
          <div className="merch-cart-row-controls">
            <p className="merch-cart-row-option">
              <span>{options}</span>
              {editOptions && (
                <>
                  {" "}
                  <button
                    className="merch-cart-edit-toggle"
                    type="button"
                    aria-expanded={editing}
                    aria-controls={editId}
                    onClick={() => setEditing((v) => !v)}
                  >
                    แก้ไขตัวเลือก
                  </button>
                </>
              )}
            </p>
            <form
              id={formId}
              className="merch-cart-row-actions"
              onSubmit={(e) => {
                e.preventDefault();
                if (count !== null && line.valid) onUpdate({ quantity: count });
              }}
            >
              <div className="merch-cart-stepper">
                <button
                  type="button"
                  aria-label={`ลดจำนวน ${name}`}
                  disabled={busy || !line.valid || count === null || count <= 1}
                  onClick={() => onUpdate({ quantity: count! - 1 })}
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <label
                  className="merch-sr-only"
                  htmlFor={`quantity-${line.id}`}
                >
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
                    count >= MAX_QUANTITY
                  }
                  onClick={() => onUpdate({ quantity: count! + 1 })}
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
            </form>
          </div>
          <p className="merch-cart-unit-price">
            {line.unitPriceBaht === null ? "—" : formatBaht(line.unitPriceBaht)}
            <small>
              {` / ${unitWord}`}
              {line.quantity > 1 &&
                line.lineTotalBaht !== null &&
                ` · รวม ${formatBaht(line.lineTotalBaht)}`}
            </small>
          </p>
          {priceChange && (
            <p className="merch-cart-notice">
              ราคาปรับจาก {formatBaht(priceChange.from)} เป็น{" "}
              {formatBaht(priceChange.to)} กรุณาตรวจสอบอีกครั้ง
            </p>
          )}
          {product?.kind === "bundle" && (
            <ul
              className="merch-cart-components"
              aria-label="ส่วนประกอบต่อหนึ่งชุด"
            >
              {product.components.map((c) => {
                let variant: VariantDto | null | undefined = c.fixedVariant;
                if (c.mode === "selectable") {
                  const chosen = line.bundleSelections.find(
                    (s) => s.componentId === c.id,
                  );
                  variant = c.allowedVariants.find(
                    (v) => v.id === chosen?.variantId,
                  );
                }
                return (
                  <li key={c.id}>
                    {c.nameTh} × {c.quantityPerBundle} ·{" "}
                    {variant
                      ? variantLabel(variant) || "กำหนดไว้ในชุด"
                      : "ตัวเลือกเดิมไม่พร้อมขาย"}
                  </li>
                );
              })}
            </ul>
          )}
          {count === null && (
            <p role="alert">กรุณาระบุจำนวนเต็มระหว่าง 1 ถึง {MAX_QUANTITY}</p>
          )}
          {quantity !== String(line.quantity) && (
            <button
              className="merch-cart-secondary"
              type="submit"
              form={formId}
              disabled={busy || count === null || !line.valid}
            >
              บันทึกจำนวน
            </button>
          )}
          {issues.map((message) => (
            <p className="merch-cart-issue" key={message}>
              {message}
            </p>
          ))}
          {editOptions && (
            <div className="merch-cart-edit" id={editId} hidden={!editing}>
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
                disabled={busy || !selectionComplete(product, selection)}
                onClick={saveOptions}
              >
                บันทึกตัวเลือก
              </button>
            </div>
          )}
          {!line.valid && product && (
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
