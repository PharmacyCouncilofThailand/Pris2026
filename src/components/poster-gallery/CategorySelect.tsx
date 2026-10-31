"use client";

import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ALL_CATEGORIES } from "@/lib/posterGalleryFilter";

type Props = {
  categories: string[];
  counts: Map<string, number>;
  total: number;
  value: string;
  onChange: (value: string) => void;
};

export function CategorySelect({
  categories,
  counts,
  total,
  value,
  onChange,
}: Props) {
  const t = useTranslations("posterGallery");
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const options = [
    { value: ALL_CATEGORIES, label: t("allCategories"), count: total },
    ...categories.map((c) => ({
      value: c,
      label: c,
      count: counts.get(c) ?? 0,
    })),
  ];
  const enabled = options
    .map((o, i) => (o.count > 0 || o.value === value ? i : -1))
    .filter((i) => i >= 0);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (open)
      listRef.current
        ?.querySelector(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };
  const choose = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  };
  const move = (step: number) => {
    const at = enabled.indexOf(active);
    setActive(enabled[Math.max(0, Math.min(enabled.length - 1, at + step))]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") move(1);
    else if (e.key === "ArrowUp") move(-1);
    else if (e.key === "Home") setActive(enabled[0]);
    else if (e.key === "End") setActive(enabled[enabled.length - 1]);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    } else if (e.key === "Tab") setOpen(false);
    else return;
    if (e.key !== "Tab") e.preventDefault();
  };

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={rootRef} className="relative w-full lg:w-[300px] shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("category")}
        onClick={() => (open ? setOpen(false) : openList())}
        className={cn(
          "h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-slate-800 cursor-pointer flex items-center gap-2.5 transition",
          open
            ? "border-orange-500 bg-white ring-[3px] ring-orange-500/15"
            : "border-slate-300 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-400",
        )}
      >
        <SlidersHorizontal
          className={cn(
            "size-4 shrink-0",
            value !== ALL_CATEGORIES ? "text-orange-600" : "text-slate-400",
          )}
        />
        <span className="flex-1 min-w-0 truncate text-left">
          {selected.label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180 text-orange-600",
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={t("category")}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onKeyDown}
          className="absolute left-0 right-0 lg:left-auto lg:w-[max(100%,340px)] top-full mt-2 z-40 max-h-[min(360px,60vh)] overflow-y-auto rounded-2xl border border-slate-300 bg-white p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.14)] outline-none animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {options.map((o, i) => {
            const disabled = !enabled.includes(i);
            return (
              <li key={o.value} role="presentation">
                {i === 1 && <div className="h-px bg-slate-100 my-1" />}
                <div
                  role="option"
                  id={`${listId}-${i}`}
                  data-index={i}
                  aria-selected={o.value === value}
                  aria-disabled={disabled || undefined}
                  onClick={() => !disabled && choose(i)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm leading-snug",
                    disabled ? "opacity-45 cursor-default" : "cursor-pointer",
                    o.value === value
                      ? "bg-orange-50 text-orange-950 font-bold"
                      : "text-slate-700",
                    !disabled && o.value !== value && "hover:bg-slate-100/80",
                    i === active &&
                      o.value !== value &&
                      !disabled &&
                      "bg-slate-100/80",
                  )}
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0 text-orange-600",
                      o.value !== value && "invisible",
                    )}
                  />
                  <span className="flex-1">{o.label}</span>
                  <span
                    className={cn(
                      "text-xs font-mono tabular-nums",
                      o.value === value ? "text-orange-700" : "text-slate-400",
                    )}
                  >
                    {o.count}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
