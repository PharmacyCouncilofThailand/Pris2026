"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  PRIVACY_NOTICE_SECTIONS,
  PRIVACY_NOTICE_TITLE,
  type PrivacyBlock,
} from "@/data/privacyNotice";

const NUMBERED = /^(\d+(?:\.\d+)?)\.?\s+(.*)$/;

function Heading({
  text,
  level,
}: {
  text: string;
  level: "section" | "sub";
}) {
  const m = NUMBERED.exec(text);
  const isSection = level === "section";
  const Tag = isSection ? "h4" : "h5";
  return (
    <Tag
      className={
        isSection
          ? "flex gap-3 text-[16px] font-bold leading-snug text-gray-900"
          : "mt-5 flex gap-3 text-[14px] font-bold leading-snug text-gray-900"
      }
    >
      {m ? (
        <>
          <span className="w-8 shrink-0 tabular-nums text-gray-400">
            {m[1]}
          </span>
          <span>{m[2]}</span>
        </>
      ) : (
        text
      )}
    </Tag>
  );
}

function Block({ block }: { block: PrivacyBlock }) {
  switch (block.type) {
    case "h":
      return <Heading text={block.text} level="sub" />;
    case "p":
      return <p className="mt-2">{block.text}</p>;
    case "ol":
      return (
        <ol className="mt-3 list-decimal space-y-2 pl-5 marker:font-medium marker:text-gray-400">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full table-fixed border-collapse text-left text-[12.5px] leading-relaxed sm:text-[13px]">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                {block.head.map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 font-bold sm:px-4 ${
                      i === 0 ? "w-2/5 sm:w-1/3" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map(([a, b]) => (
                <tr key={a} className="border-t border-gray-200 align-top">
                  <td className="bg-gray-50/70 px-3 py-2.5 font-medium text-gray-900 sm:px-4">
                    {a}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

const NoticeSections = React.memo(function NoticeSections() {
  return (
    <>
      {PRIVACY_NOTICE_SECTIONS.map((section, i) => (
        <section
          key={i}
          className={i > 0 ? "mt-7 border-t border-gray-100 pt-7" : undefined}
        >
          {section.title && <Heading text={section.title} level="section" />}
          <div className="sm:pl-11">
            {section.blocks.map((block, j) => (
              <Block key={j} block={block} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
});

export default function ConsentCheckbox() {
  const t = useTranslations("auth");
  const titleId = useId();
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [modalAgreed, setModalAgreed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const measure = useCallback(() => {
    frame.current = 0;
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (barRef.current) {
      const ratio = max > 0 ? Math.min(1, el.scrollTop / max) : 1;
      barRef.current.style.transform = `scaleX(${ratio})`;
    }
    setAtBottom(max <= 0 || el.scrollTop >= max - 8);
  }, []);

  const updateScroll = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(measure);
  }, [measure]);

  useEffect(() => {
    if (!open) return;
    updateScroll();
    window.addEventListener("resize", updateScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      window.removeEventListener("resize", updateScroll);
    };
  }, [open, updateScroll]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const accept = () => {
    setChecked(true);
    setOpen(false);
  };

  const openDialog = () => {
    setAtBottom(false);
    setModalAgreed(false);
    setOpen(true);
  };

  const openModal = (e: React.SyntheticEvent) => {
    e.preventDefault();
    openDialog();
  };

  const linkClass =
    "font-bold text-gray-900 hover:underline focus-visible:underline outline-none";

  return (
    <>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded-[4px] border-gray-300 text-black focus:ring-black cursor-pointer transition-colors checked:border-black"
          required
          checked={checked}
          onChange={(e) => {
            if (e.target.checked) openDialog();
            else setChecked(false);
          }}
        />
        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors select-none">
          {t("iAgree")}{" "}
          <button type="button" onClick={openModal} className={linkClass}>
            {t("tos")}
          </button>{" "}
          {t("and")}{" "}
          <button type="button" onClick={openModal} className={linkClass}>
            {t("privacy")}
          </button>
        </span>
      </label>

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
          style={{ zIndex: 9999 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in">
            <div className="relative flex items-center justify-between px-6 py-5 md:px-8">
              <h3
                id={titleId}
                className="text-lg font-bold tracking-tight text-gray-900"
              >
                {PRIVACY_NOTICE_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10"
                aria-label={t("consentClose")}
              >
                <X className="h-4 w-4 text-black/60" />
              </button>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gray-200">
                <div
                  ref={barRef}
                  className="h-full origin-left bg-black"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            </div>

            <div
              ref={scrollRef}
              onScroll={updateScroll}
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 text-[13.5px] leading-[1.85] text-gray-600 md:px-8"
            >
              <NoticeSections />

              <label
                className={`mt-8 flex items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${
                  atBottom
                    ? "cursor-pointer border-gray-300 bg-gray-50"
                    : "cursor-not-allowed border-gray-200 bg-gray-50/50 opacity-60"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 cursor-[inherit] rounded-[4px] border-gray-300 text-black focus:ring-black"
                  checked={modalAgreed}
                  disabled={!atBottom}
                  onChange={(e) => setModalAgreed(e.target.checked)}
                />
                <span className="text-sm font-bold text-gray-900">
                  {t("consentAgreeTerms")}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex sm:justify-end md:px-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-black/5"
              >
                {t("consentClose")}
              </button>
              {atBottom ? (
                <button
                  type="button"
                  onClick={accept}
                  disabled={!modalAgreed}
                  className="rounded-2xl bg-black px-8 py-3 text-sm font-bold text-white transition-all hover:bg-gray-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                >
                  {t("consentAccept")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="rounded-2xl border border-black px-6 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-black hover:text-white"
                >
                  {t("consentScroll")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
