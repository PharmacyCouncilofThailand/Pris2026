"use client";
import type { LineSelection, ProductDto } from "@/types/merchandise";
import { variantLabel } from "@/lib/merchandiseSelection";
import VariantSelector from "./VariantSelector";
export default function BundleSelector({
  product,
  selection,
  onChange,
  disabled,
}: {
  product: ProductDto;
  selection: LineSelection;
  onChange(selection: LineSelection): void;
  disabled: boolean;
}) {
  return (
    <section className="merch-bundle-components" aria-label="สินค้าในหนึ่งชุด">
      <h2>สินค้าใน 1 ชุด</h2>
      {product.components.map((component) => {
        const chosen =
          selection.bundleSelections.find((s) => s.componentId === component.id)
            ?.variantId ?? null;
        const fixed = component.allowedVariants.find(
          (v) => v.id === component.fixedVariantId,
        );
        return (
          <div className="merch-bundle-component" key={component.id}>
            <h3>
              {component.nameTh} × {component.quantityPerBundle}
            </h3>
            {component.optionMode === "fixed" ? (
              <p>
                {fixed ? variantLabel(fixed) : "ตัวเลือกที่กำหนดไว้ในชุด"} ·
                กำหนดไว้ในชุด
              </p>
            ) : (
              <VariantSelector
                key={component.id}
                variants={component.allowedVariants}
                selectedId={chosen}
                label={`ตัวเลือกของ${component.nameTh}`}
                disabled={disabled}
                onChange={(variantId) =>
                  onChange({
                    ...selection,
                    bundleSelections: [
                      ...selection.bundleSelections.filter(
                        (s) => s.componentId !== component.id,
                      ),
                      ...(variantId
                        ? [{ componentId: component.id, variantId }]
                        : []),
                    ],
                  })
                }
              />
            )}
          </div>
        );
      })}
      <p>ราคาขายรวมต่อชุด ไม่คิดราคาส่วนประกอบเพิ่ม</p>
    </section>
  );
}
