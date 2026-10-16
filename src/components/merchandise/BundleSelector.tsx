"use client";
import type { ProductDto } from "@/types/merchandise";
import { variantLabel, type Selection } from "@/lib/merchandiseSelection";
import VariantSelector from "./VariantSelector";

/** Shows every component; only `selectable` ones take a choice (and are sent). */
export default function BundleSelector({
  product,
  selection,
  onChange,
  disabled,
}: {
  product: ProductDto;
  selection: Selection;
  onChange(selection: Selection): void;
  disabled: boolean;
}) {
  return (
    <section className="merch-bundle-components" aria-label="สินค้าในหนึ่งชุด">
      <h2>สินค้าใน 1 ชุด</h2>
      {product.components.map((component) => {
        const chosen =
          selection.bundleSelections.find((s) => s.componentId === component.id)
            ?.variantId ?? null;
        return (
          <div className="merch-bundle-component" key={component.id}>
            <h3>
              {component.nameTh} × {component.quantityPerBundle}
            </h3>
            {component.mode === "fixed" ? (
              <p>
                {component.fixedVariant &&
                variantLabel(component.fixedVariant) ? (
                  <>{variantLabel(component.fixedVariant)} · </>
                ) : null}
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
