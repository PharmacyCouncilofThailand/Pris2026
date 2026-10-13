"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
export default function SignupDropdown({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  describedBy,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);
  useEffect(() => {
    if (!open || disabled) return;
    const selected = rootRef.current?.querySelector<HTMLButtonElement>(
      '[role="option"][aria-selected="true"]',
    );
    const first =
      rootRef.current?.querySelector<HTMLButtonElement>('[role="option"]');
    (selected ?? first)?.focus();
  }, [open, disabled]);
  return (
    <div
      className="relative"
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (
          !open &&
          !disabled &&
          (event.key === "ArrowDown" || event.key === "ArrowUp")
        ) {
          event.preventDefault();
          setOpen(true);
          return;
        }
        if (event.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
        if (open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
          event.preventDefault();
          const buttons = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              '[role="option"]',
            ),
          );
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          const next =
            index < 0
              ? event.key === "ArrowDown"
                ? 0
                : buttons.length - 1
              : (index +
                  (event.key === "ArrowDown" ? 1 : -1) +
                  buttons.length) %
                buttons.length;
          buttons[next]?.focus();
        }
      }}
    >
      <label
        className="block text-sm font-bold text-gray-900 mb-2"
        htmlFor={id}
      >
        {label} <span className="text-red-500">*</span>
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-describedby={describedBy}
        onClick={() => setOpen(!open)}
        className={`w-full text-left bg-[#f8f9fc] border rounded-2xl py-3.5 px-5 text-sm font-medium outline-none transition-all flex items-center justify-between gap-3 focus:border-gray-200 focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${open ? "bg-white border-gray-200 ring-4 ring-gray-100" : "border-transparent"} ${value ? "text-gray-900" : "text-gray-400"}`}
      >
        <span className="min-w-0 break-words">
          {options.find((option) => option.value === value)?.label ||
            placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && !disabled && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-labelledby={id}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors focus:bg-gray-100 focus:text-gray-900 outline-none ${value === option.value ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-[#f8f9fc]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
