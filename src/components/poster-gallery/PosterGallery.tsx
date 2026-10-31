"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import PageHero from "@/components/sections/PageHero";
import { PosterImage } from "@/components/poster-kiosk/PosterImage";
import { getPosterKiosk } from "@/lib/presentationApi";
import {
  ALL_CATEGORIES,
  filterGallery,
  galleryCategories,
  galleryCounts,
  galleryPosters,
  type GalleryPoster,
  type PosterTypeFilter,
} from "@/lib/posterGalleryFilter";
import { cn } from "@/lib/utils";
import { CategorySelect } from "./CategorySelect";
import { PosterGalleryViewer } from "./PosterGalleryViewer";

const TYPES: {
  key: PosterTypeFilter;
  label: "typeAll" | "typeHighlighted" | "typePoster";
}[] = [
  { key: "all", label: "typeAll" },
  { key: "highlighted-poster", label: "typeHighlighted" },
  { key: "poster", label: "typePoster" },
];

const ROWS_PER_PAGE = 3;

/** Columns of the grid at the current width; mirrors the min-[1101px] grid class. */
const columnsFor = (width: number) => (width >= 1101 ? 4 : 3);
function useGridColumns(): number {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener("resize", notify);
      return () => window.removeEventListener("resize", notify);
    },
    () => columnsFor(window.innerWidth),
    () => 4,
  );
}

/** Renders the poster only once its card is near the viewport (PDF thumbnails are costly). */
function LazyThumb({ item }: { item: GalleryPoster }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="aspect-[9/16] w-full bg-slate-100">
      {near && <PosterImage file={item.file} variant="thumb" alt="" />}
    </div>
  );
}

export function PosterGallery() {
  const t = useTranslations("posterGallery");
  const [roster, setRoster] = useState<GalleryPoster[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [type, setType] = useState<PosterTypeFilter>("all");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [rows, setRows] = useState(ROWS_PER_PAGE);
  const columns = useGridColumns();

  useEffect(() => {
    const controller = new AbortController();
    getPosterKiosk(controller.signal).then(
      (items) => !controller.signal.aborted && setRoster(galleryPosters(items)),
      () => !controller.signal.aborted && setFailed(true),
    );
    return () => controller.abort();
  }, [attempt]);

  const filter = useMemo(() => ({ type, category }), [type, category]);
  const list = useMemo(
    () => (roster ? filterGallery(roster, filter) : []),
    [roster, filter],
  );
  const counts = useMemo(
    () => (roster ? galleryCounts(roster, filter) : null),
    [roster, filter],
  );
  const categories = useMemo(
    () => (roster ? galleryCategories(roster) : []),
    [roster],
  );

  const step = useCallback(
    (delta: -1 | 1) => {
      if (openIndex === null) return;
      const next = Math.max(0, Math.min(list.length - 1, openIndex + delta));
      setOpenIndex(next);
      // Stepping past the loaded cards reveals the next rows behind the viewer.
      if (next >= rows * columns) setRows((n) => n + ROWS_PER_PAGE);
    },
    [list.length, openIndex, rows, columns],
  );
  const reset = () => {
    setType("all");
    setCategory(ALL_CATEGORIES);
    setRows(ROWS_PER_PAGE);
  };
  const visibleCount = rows * columns;
  const visible = list.slice(0, visibleCount);
  const opened = openIndex === null ? null : list[openIndex];

  return (
    <main className="bg-white text-slate-900 min-h-screen">
      <PageHero
        eyebrow={t("eyebrow")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("subtitle")}
      />

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
        <div className="md:sticky md:top-[68px] z-20 flex flex-col gap-3 border-b border-slate-200 bg-white/95 py-3.5 md:backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <p
            className="text-[15px] text-slate-600 whitespace-nowrap"
            aria-live="polite"
          >
            {roster &&
              t.rich("count", {
                count: list.length,
                n: (chunks) => (
                  <b className="mx-1 text-xl font-bold tabular-nums text-slate-900">
                    {chunks}
                  </b>
                ),
              })}
          </p>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div
              role="group"
              aria-label={t("typeGroup")}
              className="grid grid-cols-[auto_1fr_auto] gap-1.5 sm:flex sm:gap-2"
            >
              {TYPES.map(({ key, label }) => {
                const active = type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    disabled={!roster}
                    onClick={() => {
                      setType(key);
                      setRows(ROWS_PER_PAGE);
                    }}
                    className={cn(
                      "inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border pl-3 pr-1.5 text-[13px] sm:gap-2 sm:pl-4 sm:text-sm font-semibold transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                    )}
                  >
                    {key === "highlighted-poster" ? (
                      <>
                        <span className="sm:hidden">
                          {t("typeHighlightedShort")}
                        </span>
                        <span className="hidden sm:inline">{t(label)}</span>
                      </>
                    ) : (
                      t(label)
                    )}
                    <span
                      className={cn(
                        "min-w-6 rounded-full px-2 py-0.5 text-center font-mono text-xs tabular-nums",
                        key === "all" && "max-[360px]:hidden",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {counts ? counts.types[key] : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
            {roster && counts && (
              <CategorySelect
                categories={categories}
                counts={counts.categories}
                total={counts.categoryTotal}
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  setRows(ROWS_PER_PAGE);
                }}
              />
            )}
          </div>
        </div>

        {!roster && !failed && (
          <p role="status" className="py-24 text-center text-slate-500">
            {t("loading")}
          </p>
        )}
        {failed && !roster && (
          <div role="alert" className="py-24 text-center">
            <p className="text-slate-700">{t("loadError")}</p>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                setAttempt((n) => n + 1);
              }}
              className="mt-4 min-h-11 cursor-pointer rounded-full bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              {t("retry")}
            </button>
          </div>
        )}
        {roster && list.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-700">
              {roster.length === 0 ? t("emptyList") : t("emptyFilter")}
            </p>
            {roster.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="mt-4 min-h-11 cursor-pointer rounded-full bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-black"
              >
                {t("resetFilters")}
              </button>
            )}
          </div>
        )}

        {list.length > 0 && (
          <>
            <ul className="grid grid-cols-3 gap-x-3 gap-y-6 pt-6 min-[761px]:gap-x-5 min-[761px]:gap-y-9 min-[761px]:pt-10 min-[1101px]:grid-cols-4 min-[1101px]:gap-x-7 min-[1101px]:gap-y-11 pb-10">
              {visible.map((item, index) => {
                const highlighted =
                  item.presentationType === "highlighted-poster";
                return (
                  <li
                    key={item.trackingId}
                    className="[content-visibility:auto] [contain-intrinsic-size:auto_420px]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(index)}
                      aria-label={t("openWork", {
                        trackingId: item.trackingId,
                      })}
                      className="group flex w-full cursor-pointer flex-col gap-2 text-left focus-visible:outline-[3px] focus-visible:outline-offset-[6px] focus-visible:outline-blue-600 rounded-xl min-[761px]:gap-3"
                    >
                      <span className="relative block overflow-hidden rounded-lg border border-slate-200 bg-white transition duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_36px_-12px_rgba(17,24,39,0.28)] min-[761px]:rounded-xl">
                        <LazyThumb item={item} />
                        {highlighted && (
                          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-orange-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm min-[761px]:left-2 min-[761px]:top-2 min-[761px]:px-2.5 min-[761px]:text-[11px]">
                            <Star
                              className="size-[11px] fill-current"
                              aria-hidden="true"
                            />
                            <span className="hidden min-[761px]:inline">
                              {t("badgeHighlighted")}
                            </span>
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="font-mono text-[10px] font-semibold tabular-nums text-blue-600 min-[761px]:text-xs">
                          {item.trackingId}
                        </span>
                        <span className="line-clamp-2 text-[12.5px] font-bold leading-snug text-slate-900 min-[761px]:line-clamp-3 min-[761px]:text-[15px]">
                          {item.title}
                        </span>
                        <span className="truncate text-[11px] text-slate-500 min-[761px]:text-[13px]">
                          {item.submitterName ?? t("authorUnknown")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col items-center gap-3 pb-20 md:pb-28">
              <p className="text-sm text-slate-500" aria-live="polite">
                {t("shownOf", { shown: visible.length, total: list.length })}
              </p>
              {visible.length < list.length && (
                <button
                  type="button"
                  onClick={() => setRows((n) => n + ROWS_PER_PAGE)}
                  className="min-h-12 cursor-pointer rounded-full bg-slate-900 px-8 text-sm font-bold text-white transition hover:bg-black active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {t("loadMore")}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {opened && openIndex !== null && (
        <PosterGalleryViewer
          item={opened}
          position={openIndex}
          total={list.length}
          onClose={() => setOpenIndex(null)}
          onStep={step}
        />
      )}
    </main>
  );
}
