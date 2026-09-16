"use client";

import { Fragment, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, ExternalLink, Search, X, User, Tag, Calendar, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHero from "@/components/sections/PageHero";
import { approvedRound1Abstracts } from "@/data/approvedRound1Abstracts";
import {
  extractDistinctCategories,
  filterAcceptedAbstracts,
  type AcceptedAbstract,
} from "@/lib/acceptedAbstractsFilter";

const presentationGroupOrder = [
  "oral",
  "highlighted-poster",
  "poster",
] as const;

const approvedAbstractsPdfUrl = "/documents/approved-abstracts-round-1.pdf";

export default function ApprovedAbstractsPage() {
  const t = useTranslations("approvedAbstracts");

  const abstracts = approvedRound1Abstracts;

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedType, setSelectedType] = useState<
    "all" | "oral" | "highlighted-poster" | "poster"
  >("all");
  const [selectedRound, setSelectedRound] = useState<"1" | "2">("1");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  const categories = useMemo(
    () => extractDistinctCategories(approvedRound1Abstracts),
    [],
  );

  const filteredAbstracts = useMemo(() => {
    return filterAcceptedAbstracts(approvedRound1Abstracts, {
      search: deferredSearchQuery,
      presentationType: selectedType,
      round: selectedRound,
      categoryId: selectedCategory,
    });
  }, [deferredSearchQuery, selectedType, selectedRound, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedRound("1");
    setSelectedCategory("all");
  };

  const presentationLabels = {
    oral: t("oralPresentation"),
    "highlighted-poster": t("highlightedPosterPresentation"),
    poster: t("posterPresentation"),
  } as const;

  const presentationGroupStyles = {
    oral: {
      container: "border-l-orange-500 bg-orange-50/70",
      marker: "bg-orange-500",
      label: "text-orange-700",
    },
    "highlighted-poster": {
      container: "border-l-emerald-500 bg-emerald-50/70",
      marker: "bg-emerald-500",
      label: "text-emerald-700",
    },
    poster: {
      container: "border-l-blue-500 bg-blue-50/70",
      marker: "bg-blue-500",
      label: "text-blue-700",
    },
  } as const;

  const renderAbstractRow = (item: AcceptedAbstract) => {
    const presentationLabel = presentationLabels[item.presentationType];
    const isOral = item.presentationType === "oral";
    const isHighlightedPoster = item.presentationType === "highlighted-poster";
    const itemRound = item.round ?? 1;

    return (
      <li
        key={item.id}
        className="px-5 sm:px-6 py-5 sm:py-6 hover:bg-blue-50/20 transition-colors duration-150"
      >
        <article className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 lg:gap-6">

          <div className="flex lg:hidden items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center justify-center min-w-7 px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-bold text-gray-600">
                {item.sequence ?? item.id}
              </span>
              <span className="font-mono text-xs font-bold tracking-wider text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100">
                {item.trackingId || t("notAssigned")}
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  itemRound === 1
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-purple-50 text-purple-700 border-purple-200",
                )}
              >
                {itemRound === 1 ? t("round1Badge") : t("round2Badge")}
              </span>
            </div>
            <span
              className={cn(
                "inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs",
                isOral
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                  : isHighlightedPoster
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
              )}
            >
              {presentationLabel}
            </span>
          </div>

          <div className="hidden lg:flex w-16 shrink-0 items-start pt-0.5">
            <span className="inline-flex items-center justify-center min-w-7 px-2 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-bold text-gray-600">
              {item.sequence ?? item.id}
            </span>
          </div>

          <div className="hidden lg:block w-52 shrink-0 pt-0.5">
            <div className="flex flex-col items-start gap-1.5">
              {item.trackingId ? (
                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100 inline-block">
                  {item.trackingId}
                </span>
              ) : (
                <span className="text-xs italic text-gray-400">
                  {t("notAssigned")}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  itemRound === 1
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-purple-50 text-purple-700 border-purple-200",
                )}
              >
                {itemRound === 1 ? t("round1Badge") : t("round2Badge")}
              </span>
            </div>
          </div>

          <div className="flex-1 lg:px-4 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug break-words">
              {item.title}
            </h2>

            <div className="mt-2.5 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-600">

              <div className="flex items-center gap-1.5">
                <User className="size-3.5 text-blue-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t("submitterField")}:
                </span>
                <span className="text-gray-800 font-medium">
                  {item.submitterName || t("notSpecified")}
                </span>
              </div>

              {item.categoryName && (
                <div className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-blue-500 shrink-0" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100/80 text-gray-700 border border-gray-200/60">
                    {item.categoryName}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex w-44 shrink-0 justify-end pt-0.5">
            <span
              className={cn(
                "inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs",
                isOral
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                  : isHighlightedPoster
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
              )}
            >
              {presentationLabel}
            </span>
          </div>
        </article>
      </li>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">

      <PageHero
        eyebrow={t("eyebrow")}
        eyebrowSub={t("heroSub")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("desc")}
      />

      <section className="relative px-4 sm:px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-[1400px] mx-auto">

          <section
            aria-label={t("pdfActionsLabel")}
            className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <p className="min-w-0 max-w-4xl text-sm font-semibold leading-relaxed text-slate-800 sm:text-base">
              {t("pdfDocumentTitle")}
            </p>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
              <a
                href={approvedAbstractsPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 text-xs font-bold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto"
              >
                <ExternalLink aria-hidden="true" className="size-3.5" />
                {t("viewPdf")}
              </a>
              <a
                href={approvedAbstractsPdfUrl}
                download="approved-abstracts-round-1.pdf"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto"
              >
                <Download aria-hidden="true" className="size-3.5" />
                {t("downloadPdf")}
              </a>
            </div>
          </section>

          <div className="relative z-20 mb-6 overflow-hidden rounded-[1.35rem] border border-gray-200/80 bg-white p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:p-6">

            <div className="relative mb-5 sm:mb-4">
              <label htmlFor="abstract-search" className="sr-only">
                {t("searchLabel")}
              </label>
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400 sm:size-5" />
                <input
                  id="abstract-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-11 pr-11 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 sm:h-12 md:text-base"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                    aria-label={t("clearSearch")}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5 pt-0 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2 lg:hidden">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    {t("filterType")}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-gray-100" />
                </div>
                <div
                  className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5"
                  role="group"
                  aria-label={t("filterType")}
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1 hidden sm:inline-block">
                    {t("filterType")}:
                  </span>
                  {(
                    [
                      { key: "all", label: t("filterAll") },
                      { key: "oral", label: t("filterOral") },
                      { key: "highlighted-poster", label: t("filterHighlightedPoster") },
                      { key: "poster", label: t("filterPoster") },
                    ] as const
                  ).map((typeItem) => {
                    const isSelected = selectedType === typeItem.key;
                    return (
                      <button
                        key={typeItem.key}
                        type="button"
                        onClick={() => setSelectedType(typeItem.key)}
                        aria-pressed={isSelected}
                        className={cn(
                          "h-auto min-h-10 w-full px-2.5 py-2 text-[10px] font-black leading-tight tracking-[0.08em] rounded-xl border transition-all cursor-pointer whitespace-normal sm:h-9 sm:min-h-0 sm:w-auto sm:px-3.5 sm:py-0 sm:text-xs sm:leading-normal sm:tracking-wider sm:whitespace-nowrap",
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                        )}
                      >
                        {typeItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <span aria-hidden="true" className="hidden lg:inline-block text-gray-200">|</span>

              <div className="min-w-0 flex-1 lg:flex-none">
                <div className="mb-2 flex items-center gap-2 lg:hidden">
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                    {t("filterRound")}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-gray-100" />
                </div>
                <div
                  className="grid w-full grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-1.5"
                  role="group"
                  aria-label={t("filterRound")}
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1 hidden sm:inline-block">
                    {t("filterRound")}:
                  </span>
                  {(
                    [
                      { key: "1" as const, label: t("filterRound1") },
                      { key: "2" as const, label: t("filterRound2") },
                    ] as const
                  ).map((roundItem) => {
                    const isSelected = selectedRound === roundItem.key;
                    return (
                      <button
                        key={roundItem.key}
                        type="button"
                        onClick={() => setSelectedRound(roundItem.key)}
                        aria-pressed={isSelected}
                        className={cn(
                          "h-10 w-full px-3 text-[10px] font-black uppercase tracking-[0.08em] rounded-xl border transition-all cursor-pointer sm:h-9 sm:w-auto sm:px-3.5 sm:text-xs sm:tracking-wider",
                          isSelected
                            ? roundItem.key === "1"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"
                              : "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                        )}
                      >
                        {roundItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5 lg:w-auto lg:min-w-[320px]">
                <label
                  htmlFor="category-select"
                  className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 sm:text-xs sm:font-semibold sm:tracking-wider sm:text-gray-500"
                >
                  {t("filterCategory")}:
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 w-full min-w-0 max-w-none bg-white border border-gray-200 rounded-xl px-3 text-xs sm:h-9 sm:max-w-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
                >
                  <option value="all">{t("allCategories")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className={cn(
                "mt-5 flex flex-col gap-3 border-t pt-4 text-xs transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-2.5",
                selectedRound === "1"
                  ? "border-emerald-100 text-emerald-950"
                  : "border-purple-100 text-purple-950",
              )}
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className={cn(
                    "inline-flex items-center justify-center size-6 rounded-lg shrink-0",
                    selectedRound === "1"
                      ? "bg-emerald-100/90 text-emerald-700"
                      : "bg-purple-100/90 text-purple-700",
                  )}
                >
                  <Calendar className="size-3.5" />
                </span>
                <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 leading-relaxed">
                  <span className="font-bold text-gray-900">
                    {selectedRound === "1" ? t("filterRound1") : t("filterRound2")}:
                  </span>
                  <span className="text-gray-600 font-medium">
                    {selectedRound === "1" ? t("round1InfoText") : t("round2InfoText")}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                    selectedRound === "1"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-purple-50 text-purple-700 border-purple-200",
                  )}
                >
                  <Clock className="size-3 shrink-0" />
                  <span>
                    {selectedRound === "1" ? t("round1Announcement") : t("round2Announcement")}
                  </span>
                </span>
              </div>
            </div>

            {selectedRound === "1" && (
              <aside
                aria-label={t("noteTitle")}
                className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-950 shadow-sm shadow-amber-100 sm:px-5 sm:py-5"
              >
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 sm:size-9">
                    <Info className="size-4 sm:size-[1.125rem]" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black tracking-wide text-amber-800 sm:text-base">
                      {t("noteTitle")}
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm font-semibold leading-relaxed text-amber-950 sm:text-base">
                      <li className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{t("revisionDeadlineNote")}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{t("pendingAnnouncementNote")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between px-1 text-xs sm:text-sm font-medium text-gray-500">
            <p aria-live="polite">
              {t("resultsCount", {
                count: filteredAbstracts.length,
                total: abstracts.length,
              })}
            </p>
            {(searchQuery || selectedType !== "all" || selectedRound !== "1" || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
              >
                {t("resetFilters")}
              </button>
            )}
          </div>

          {abstracts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-12 text-center sm:p-20">
              <h2 className="text-xl font-bold text-gray-900">{t("zeroRecordsTitle")}</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{t("zeroRecordsDesc")}</p>
            </div>
          ) : filteredAbstracts.length === 0 ? (
            selectedRound === "2" && !searchQuery && selectedType === "all" && selectedCategory === "all" ? (
              <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-10 text-center sm:p-16">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-purple-100 text-purple-600 mx-auto mb-3.5 shadow-xs">
                  <Clock className="size-7" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("round2EmptyTitle")}</h2>
                <p className="mt-2 text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">{t("round2EmptyDesc")}</p>
                <button
                  type="button"
                  onClick={() => setSelectedRound("1")}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition cursor-pointer shadow-sm shadow-emerald-500/20"
                >
                  <span>{t("viewRound1Button")}</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center sm:p-16">
                <Search className="size-10 text-gray-400 mx-auto mb-3" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("emptyTitle")}</h2>
                <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto leading-relaxed">{t("emptyDesc")}</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition cursor-pointer"
                >
                  {t("resetFilters")}
                </button>
              </div>
            )
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">

              <div className="hidden lg:flex items-center px-6 py-3.5 bg-gray-50/90 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                <div className="w-16 shrink-0">{t("sequenceCol")}</div>
                <div className="w-52 shrink-0">{t("trackingIdCol")}</div>
                <div className="flex-1 px-4">{t("researchTitleCol")}</div>
                <div className="w-44 text-right shrink-0">{t("presentationCol")}</div>
              </div>

              <ul className="divide-y divide-gray-100" role="list">
                {selectedType === "all" ? (
                  presentationGroupOrder.map((presentationType) => {
                    const groupItems = filteredAbstracts.filter(
                      (item) => item.presentationType === presentationType,
                    );

                    if (groupItems.length === 0) {
                      return null;
                    }

                    const groupStyles = presentationGroupStyles[presentationType];

                    return (
                      <Fragment key={`presentation-group-${presentationType}`}>
                        <li
                          className={cn(
                            "border-l-4 px-5 py-4 sm:px-6 lg:px-8",
                            groupStyles.container,
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden="true"
                              className={cn("size-2 shrink-0 rounded-full", groupStyles.marker)}
                            />
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                {t("filterType")}
                              </p>
                              <h3
                                className={cn(
                                  "mt-0.5 break-words text-sm font-black uppercase tracking-wider",
                                  groupStyles.label,
                                )}
                              >
                                {presentationLabels[presentationType]}
                              </h3>
                            </div>
                          </div>
                        </li>
                        {groupItems.map(renderAbstractRow)}
                      </Fragment>
                    );
                  })
                ) : (
                  filteredAbstracts.map(renderAbstractRow)
                )}
              </ul>
            </div>

          )}

        </div>
      </section>
    </main>
  );
}
