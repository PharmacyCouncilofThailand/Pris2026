"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Download,
  ExternalLink,
  Search,
  X,
  User,
  Tag,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  RotateCcw,
  Copy,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PageHero from "@/components/sections/PageHero";
import { approvedRound1Abstracts } from "@/data/approvedRound1Abstracts";
import {
  extractDistinctCategories,
  filterAcceptedAbstracts,
  type AcceptedAbstract,
} from "@/lib/acceptedAbstractsFilter";

const approvedAbstractsPdfUrl = "/documents/approved-abstracts-round-1.pdf";
const ITEMS_PER_PAGE = 10;

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  // Click outside to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, selectedType, selectedRound, selectedCategory]);

  const categories = useMemo(
    () => extractDistinctCategories(approvedRound1Abstracts),
    [],
  );

  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") return t("allCategories");
    const found = categories.find((c) => String(c.id) === String(selectedCategory));
    return found ? found.name : t("allCategories");
  }, [selectedCategory, categories, t]);

  const stats = useMemo(() => {
    const roundAbstracts = abstracts.filter(
      (item) => (item.round ?? 1) === Number(selectedRound)
    );
    return {
      all: roundAbstracts.length,
      oral: roundAbstracts.filter((item) => item.presentationType === "oral").length,
      highlightedPoster: roundAbstracts.filter(
        (item) => item.presentationType === "highlighted-poster"
      ).length,
      poster: roundAbstracts.filter((item) => item.presentationType === "poster").length,
    };
  }, [abstracts, selectedRound]);

  const filteredAbstracts = useMemo(() => {
    return filterAcceptedAbstracts(approvedRound1Abstracts, {
      search: deferredSearchQuery,
      presentationType: selectedType,
      round: selectedRound,
      categoryId: selectedCategory,
    });
  }, [deferredSearchQuery, selectedType, selectedRound, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredAbstracts.length / ITEMS_PER_PAGE));

  const paginatedAbstracts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAbstracts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAbstracts, currentPage]);

  const startIndex = filteredAbstracts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredAbstracts.length);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedRound("1");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const topElement = document.getElementById("abstracts-content-area");
    if (topElement) {
      topElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopy = (trackingId: string) => {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId);
    setCopiedId(trackingId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const presentationLabels = {
    oral: t("oralPresentation"),
    "highlighted-poster": t("highlightedPosterPresentation"),
    poster: t("posterPresentation"),
  } as const;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  return (
    <main className="relative min-h-screen bg-white text-slate-900 selection:bg-amber-100 selection:text-slate-900 font-sans">
      
      {/* ═══════════════════════════════════════════════════════════
          1. PAGE HERO (HEADER TEXT)
         ═══════════════════════════════════════════════════════════ */}
      <PageHero
        eyebrow="PRIS 2026"
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("desc")}
      />

      {/* ═══════════════════════════════════════════════════════════
          2. MAIN CONTENT AREA (BOXES & DIRECTORY)
         ═══════════════════════════════════════════════════════════ */}
      <section id="abstracts-content-area" className="relative px-3 sm:px-6 md:px-10 lg:px-12 pb-20 md:pb-32 mt-0 sm:-mt-6 md:-mt-8 z-10">
        <div className="max-w-[1360px] mx-auto space-y-3.5 sm:space-y-5">

          {/* ── Box A: Official Announcement & Document Actions ── */}
          <div className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-orange-600 text-white shadow-xs">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  {selectedRound === "1" ? t("round1Badge") : t("round2Badge")}
                </span>
                <span className="text-xs text-slate-600 font-semibold flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <Calendar className="size-3.5 text-slate-500" />
                  {selectedRound === "1" ? t("round1Announcement") : t("round2Announcement")}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {t("pdfDocumentTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
              <a
                href={approvedAbstractsPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 sm:px-4 text-xs font-bold text-slate-800 transition active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <ExternalLink className="size-3.5 text-slate-600" />
                <span>{t("viewPdf")}</span>
              </a>
              <a
                href={approvedAbstractsPdfUrl}
                download="approved-abstracts-round-1.pdf"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-3 sm:px-4 text-xs font-bold text-white transition active:scale-95 shadow-[0_4px_14px_rgba(249,115,22,0.35)]"
              >
                <Download className="size-3.5" />
                <span>{t("downloadPdf")}</span>
              </a>
            </div>
          </div>

          {/* ── Box B: Notice / Deadline Bar (No Emojis) ── */}
          {selectedRound === "1" ? (
            <div className="rounded-2xl bg-amber-50/80 border border-amber-300/90 px-4 sm:px-5 py-3 sm:py-3.5 flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <AlertCircle className="size-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold text-amber-950 mr-1.5">
                  {t("revisionDeadlineNote")} (ภายในวันที่ 15 กันยายน 2569 เวลา 23:59 น.)
                </strong>
                <span className="text-slate-600">
                  {t("pendingAnnouncementNote")}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 border border-slate-300 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm text-slate-600 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              {t("round2EmptyDesc")}
            </div>
          )}

          {/* ── Box C: Filter Hub (Tabs + Search + Category) ── */}
          <div className="bg-white rounded-2xl border border-slate-300 p-3.5 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] space-y-3.5 sm:space-y-4">
            
            {/* Presentation Tabs Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 sm:pb-3.5 border-b border-slate-200">
              
              {/* Type Switcher Tabs (Responsive 2-col on mobile / flex on tablet/desktop) */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto" role="group" aria-label="Presentation Type Tabs">
                {[
                  { key: "all" as const, label: t("filterAll"), count: stats.all },
                  { key: "oral" as const, label: t("oralPresentation"), count: stats.oral },
                  { key: "highlighted-poster" as const, label: t("highlightedPosterPresentation"), count: stats.highlightedPoster },
                  { key: "poster" as const, label: t("posterPresentation"), count: stats.poster },
                ].map((tab) => {
                  const isActive = selectedType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedType(tab.key)}
                      className={cn(
                        "inline-flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 h-10 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95",
                        isActive
                          ? "bg-orange-500 text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)] ring-2 ring-orange-500/20"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      )}
                    >
                      <span className="truncate">{tab.label}</span>
                      <span className={cn(
                        "px-1.5 sm:px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-mono font-bold shrink-0",
                        isActive ? "bg-white text-orange-600" : "bg-white text-slate-700 border border-slate-200 shadow-2xs"
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Round Switcher */}
              <div className="grid grid-cols-2 sm:inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto border border-slate-300 shadow-2xs">
                {[
                  { key: "1" as const, label: t("filterRound1") },
                  { key: "2" as const, label: t("filterRound2") },
                ].map((round) => {
                  const isActive = selectedRound === round.key;
                  return (
                    <button
                      key={round.key}
                      type="button"
                      onClick={() => setSelectedRound(round.key)}
                      className={cn(
                        "h-8 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer text-center",
                        isActive ? "bg-orange-500 text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)]" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      {round.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Search Input & Category Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  id="abstract-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50/80 pl-10 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/15 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={t("clearSearch")}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Custom Category Dropdown */}
              <div ref={categoryDropdownRef} className="relative shrink-0 w-full sm:w-80">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  className={cn(
                    "h-11 w-full rounded-xl border border-slate-300 bg-slate-50/80 px-3.5 text-xs sm:text-sm font-medium text-slate-800 cursor-pointer flex items-center justify-between gap-2 shadow-2xs transition active:scale-[0.99]",
                    isCategoryDropdownOpen
                      ? "border-orange-500 bg-white ring-2 ring-orange-500/15"
                      : "hover:bg-slate-100 hover:border-slate-400"
                  )}
                  aria-expanded={isCategoryDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <SlidersHorizontal className={cn(
                      "size-4 shrink-0 transition-colors",
                      selectedCategory !== "all" ? "text-orange-600" : "text-slate-400"
                    )} />
                    <span className="truncate text-left font-medium">
                      {selectedCategoryName}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "size-4 text-slate-400 shrink-0 transition-transform duration-200",
                    isCategoryDropdownOpen && "rotate-180 text-orange-600"
                  )} />
                </button>

                {/* Dropdown Popup Menu */}
                {isCategoryDropdownOpen && (
                  <div
                    className="absolute right-0 left-0 top-full mt-2 w-full max-h-72 sm:max-h-80 overflow-y-auto bg-white rounded-2xl border border-slate-300 shadow-[0_12px_36px_rgba(0,0,0,0.14)] p-1.5 z-50 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100"
                    role="listbox"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("all");
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition cursor-pointer",
                        selectedCategory === "all"
                          ? "bg-orange-50 text-orange-950 font-bold"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                      )}
                      role="option"
                      aria-selected={selectedCategory === "all"}
                    >
                      <span>{t("allCategories")}</span>
                      {selectedCategory === "all" && (
                        <Check className="size-4 text-orange-600 shrink-0" />
                      )}
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    {categories.map((cat) => {
                      const isSelected = String(selectedCategory) === String(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(String(cat.id));
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition cursor-pointer",
                            isSelected
                              ? "bg-orange-50 text-orange-950 font-bold"
                              : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                          )}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="leading-snug">{cat.name}</span>
                          {isSelected && (
                            <Check className="size-4 text-orange-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Results Count & Range Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium pt-1">
              <span>
                แสดง <strong className="text-slate-900 font-bold">{startIndex} – {endIndex}</strong> จากทั้งหมด {filteredAbstracts.length} ผลงาน
              </span>
              {totalPages > 1 && (
                <span className="text-slate-500 font-medium">
                  หน้า {currentPage} จาก {totalPages}
                </span>
              )}
            </div>

          </div>

          {/* ── Box D: Standalone Cards List (10 Items Per Page) ── */}
          {abstracts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              <h2 className="text-base font-bold text-slate-900">{t("zeroRecordsTitle")}</h2>
              <p className="mt-1 text-xs text-slate-500">{t("zeroRecordsDesc")}</p>
            </div>
          ) : filteredAbstracts.length === 0 ? (
            selectedRound === "2" && !searchQuery && selectedType === "all" && selectedCategory === "all" ? (
              <div className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-10 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-amber-50 text-amber-700 mx-auto mb-3 border border-amber-300">
                  <Clock className="size-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{t("round2EmptyTitle")}</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{t("round2EmptyDesc")}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-10 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                <Search className="size-10 text-slate-300 mx-auto mb-2" />
                <h2 className="text-base font-bold text-slate-900">{t("emptyTitle")}</h2>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{t("emptyDesc")}</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition cursor-pointer shadow-xs"
                >
                  {t("resetFilters")}
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3.5 sm:space-y-4">
              {paginatedAbstracts.map((item) => {
                const isOral = item.presentationType === "oral";
                const isHighlightedPoster = item.presentationType === "highlighted-poster";
                const presentationLabel = presentationLabels[item.presentationType];
                const isCopied = copiedId === item.trackingId && item.trackingId;

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-orange-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-200"
                  >
                    {/* Card Top Row: Sequence, Tracking ID, and Type Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      
                      {/* Left: Sequence + Tracking ID */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="inline-flex items-center justify-center min-w-7 px-2 py-0.5 rounded-lg border border-slate-300 bg-slate-100 text-xs font-black text-slate-700 font-mono shadow-2xs">
                          #{item.sequence ?? item.id}
                        </span>

                        {item.trackingId ? (
                          <button
                            type="button"
                            onClick={() => handleCopy(item.trackingId!)}
                            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-orange-700 bg-orange-50/80 hover:bg-orange-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-orange-200 transition cursor-pointer shadow-2xs"
                            title="คลิกเพื่อคัดลอกรหัสบทคัดย่อ"
                          >
                            <span>{item.trackingId}</span>
                            {isCopied ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-sans font-bold">
                                <Check className="size-3" /> คัดลอกแล้ว
                              </span>
                            ) : (
                              <Copy className="size-3 text-orange-400" />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs italic text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {t("notAssigned")}
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {item.round === 2 ? t("round2Badge") : t("round1Badge")}
                        </span>
                      </div>

                      {/* Right: Presentation Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-2xs shrink-0",
                          isOral
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : isHighlightedPoster
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-blue-100 text-blue-900 border border-blue-300"
                        )}
                      >
                        {presentationLabel}
                      </span>
                    </div>

                    {/* Card Middle: Research Title */}
                    <div className="py-3 sm:py-3.5">
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-snug break-words">
                        {item.title}
                      </h2>
                    </div>

                    {/* Card Bottom: Submitter & Category */}
                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                      
                      {/* Submitter */}
                      <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                        <User className="size-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400 font-semibold shrink-0">{t("submitterField")}:</span>
                        <strong className="font-bold text-slate-900 truncate">{item.submitterName || t("notSpecified")}</strong>
                      </div>

                      {/* Category */}
                      {item.categoryName && (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag className="size-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-400 font-semibold shrink-0">{t("categoryField")}:</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs truncate">
                            {item.categoryName}
                          </span>
                        </div>
                      )}
                    </div>

                  </article>
                );
              })}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              4. PAGINATION CONTROLS (แบ่งหน้าละ 10 ผลงาน - Responsive Single Bar)
             ═══════════════════════════════════════════════════════════ */}
          {totalPages > 1 && (
            <nav
              className="mt-6 sm:mt-8 flex items-center justify-between gap-1.5 sm:gap-4 bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              aria-label="Pagination"
            >
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "inline-flex items-center justify-center gap-1 h-9 sm:h-10 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0",
                  currentPage === 1
                    ? "text-slate-300 cursor-not-allowed bg-slate-50"
                    : "text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-95"
                )}
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">ก่อนหน้า</span>
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5 justify-center overflow-x-auto no-scrollbar py-0.5 max-w-[65vw] sm:max-w-none">
                {pageNumbers.map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 sm:px-2 text-slate-400 text-xs font-bold shrink-0"
                      >
                        ...
                      </span>
                    );
                  }

                  const isCurrent = currentPage === page;
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => handlePageChange(Number(page))}
                      className={cn(
                        "size-8 sm:size-10 rounded-xl text-xs sm:text-sm font-bold font-mono transition cursor-pointer active:scale-95 shrink-0",
                        isCurrent
                          ? "bg-orange-500 text-white shadow-[0_2px_8px_rgba(249,115,22,0.35)]"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "inline-flex items-center justify-center gap-1 h-9 sm:h-10 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0",
                  currentPage === totalPages
                    ? "text-slate-300 cursor-not-allowed bg-slate-50"
                    : "text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-95"
                )}
              >
                <span className="hidden sm:inline">ถัดไป</span>
                <ChevronRight className="size-4" />
              </button>
            </nav>
          )}

        </div>
      </section>

    </main>
  );
}
