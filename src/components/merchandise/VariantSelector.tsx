"use client";
import { useState } from "react";
import Image from "next/image";
import type { ImageAsset, VariantDto } from "@/types/merchandise";
import {
  optionImageId,
  optionValueImageId,
  type OptionDraft,
} from "@/lib/merchandiseSelection";
export default function VariantSelector({
  variants,
  selectedId,
  onChange,
  images = [],
  onPreviewChange,
  label = "ตัวเลือกสินค้า",
  disabled = false,
}: {
  variants: VariantDto[];
  selectedId: string | null;
  onChange(id: string | null): void;
  images?: ImageAsset[];
  onPreviewChange?(imageId: string | null): void;
  label?: string;
  disabled?: boolean;
}) {
  const selected = variants.find((v) => v.id === selectedId);
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const [draft, setDraft] = useState<OptionDraft>({
    colorTh: selected?.colorTh ?? null,
    sizeTh: selected?.sizeTh ?? null,
  });
  const colors = [
    ...new Set(
      variants.map((v) => v.colorTh).filter((v): v is string => v !== null),
    ),
  ];
  const sizes = [
    ...new Set(
      variants.map((v) => v.sizeTh).filter((v): v is string => v !== null),
    ),
  ];
  const choose = (field: "colorTh" | "sizeTh", value: string) => {
    const next = { ...draft, [field]: value };
    // Keep an existing size only when that exact combination is sold. Never
    // substitute another size merely because the customer changed colour.
    if (
      field === "colorTh" &&
      next.sizeTh !== null &&
      !variants.some(
        (v) => v.saleEnabled && v.colorTh === value && v.sizeTh === next.sizeTh,
      )
    )
      next.sizeTh = null;
    setDraft(next);
    onPreviewChange?.(optionImageId(variants, next));
    const match = variants.find(
      (v) =>
        v.saleEnabled && v.colorTh === next.colorTh && v.sizeTh === next.sizeTh,
    );
    onChange(match?.id ?? null);
  };
  if (!colors.length && !sizes.length)
    return (
      <div className="merch-detail-options" aria-label={label}>
        <div className="merch-detail-choices">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={disabled || !v.saleEnabled}
              aria-pressed={selectedId === v.id}
              onClick={() => onChange(v.id)}
            >
              เลือกสินค้านี้
            </button>
          ))}
        </div>
      </div>
    );
  return (
    <div className="merch-detail-options" aria-label={label}>
      {(
        [
          ["colorTh", "สี", colors],
          ["sizeTh", "ขนาด", sizes],
        ] as const
      ).map(
        ([field, title, values]) =>
          values.length > 0 && (
            <fieldset key={field} disabled={disabled}>
              <legend>{title}</legend>
              <div className="merch-detail-choices">
                {values.map((value) => {
                  const available = variants.some(
                    (v) =>
                      v.saleEnabled &&
                      v[field] === value &&
                      (field !== "sizeTh" ||
                        draft.colorTh === null ||
                        v.colorTh === draft.colorTh),
                  );
                  const thumb = images.find(
                    (image) =>
                      image.id === optionValueImageId(variants, field, value),
                  );
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      aria-pressed={draft[field] === value && available}
                      onClick={() => choose(field, value)}
                    >
                      {thumb && !failed.has(thumb.id) && (
                        <Image
                          unoptimized
                          src={thumb.url}
                          width={32}
                          height={32}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className="merch-option-thumb"
                          onError={() =>
                            setFailed((f) => new Set(f).add(thumb.id))
                          }
                        />
                      )}
                      {value}
                      {!available && (
                        <span className="merch-sr-only"> — ไม่เปิดขาย</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ),
      )}
    </div>
  );
}
