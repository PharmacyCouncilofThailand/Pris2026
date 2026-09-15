"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X, User, Tag, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import PageHero from "@/components/sections/PageHero";
import { approvedRound1Abstracts } from "@/data/approvedRound1Abstracts";
import {
  extractDistinctCategories,
  filterAcceptedAbstracts,
} from "@/lib/acceptedAbstractsFilter";

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

          <div className="relative z-20 mb-6 rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

            <div className="relative mb-4">
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
                  className="w-full h-12 bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-11 text-sm md:text-base font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
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

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-3">

                <div
                  className="flex items-center gap-1.5"
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
                          "h-9 px-3.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer",
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

                <span className="hidden sm:inline-block text-gray-300">|</span>

                <div
                  className="flex items-center gap-1.5"
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
                          "h-9 px-3.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer",
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

              <div className="flex items-center gap-2.5">
                <label
                  htmlFor="category-select"
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0"
                >
                  {t("filterCategory")}:
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 min-w-[200px] max-w-full sm:max-w-xs bg-white border border-gray-200 rounded-xl px-3 text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
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
                "mt-4 pt-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors",
                selectedRound === "1"
                  ? "border-emerald-100 text-emerald-950"
                  : "border-purple-100 text-purple-950",
              )}
            >
              <div className="flex items-center gap-2.5">
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
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-bold text-gray-900">
                    {selectedRound === "1" ? t("filterRound1") : t("filterRound2")}:
                  </span>
                  <span className="text-gray-600 font-medium">
                    {selectedRound === "1" ? t("round1InfoText") : t("round2InfoText")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
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
                {filteredAbstracts.map((item) => {
                  const presentationLabel = {
                    oral: t("oralPresentation"),
                    "highlighted-poster": t("highlightedPosterPresentation"),
                    poster: t("posterPresentation"),
                  }[item.presentationType];
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
                })}
              </ul>
            </div>

          )}

        </div>
      </section>
    </main>
  );
}
