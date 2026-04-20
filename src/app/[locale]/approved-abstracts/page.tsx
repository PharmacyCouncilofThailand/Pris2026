"use client";

import { useDeferredValue, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Building2, ChevronDown, FileText, Search, User } from "lucide-react";
import { approvedPosterAbstracts, type ApprovedPosterAbstract } from "@/data/approvedPosterAbstracts";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type PageCopy = {
  eyebrow: string;
  title1: string;
  title2: string;
  desc: string;
  searchPlaceholder: string;
  approvedBadge: string;
  emptyTitle: string;
  emptyDesc: string;
  presenterField: string;
  institutionField: string;
  oralPresentation: string;
  posterPresentation: string;
  totalResults: string;
  showMore: string;
  showLess: string;
};

export default function ApprovedAbstractsPage() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const heroRef = useRef<HTMLElement>(null!);

  useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
      gsap.from(".hero-line", {
        yPercent: 110,
        stagger: 0.12,
        duration: 1.6,
        ease: "power4.out",
        delay: 0.15,
      });
      gsap.from(".hero-sub", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.8,
      });
  }, { scope: heroRef });

  const copy: PageCopy = locale === "th"
    ? {
        eyebrow: "ค้นหา Abstract",
        title1: "Approved",
        title2: "Abstracts",
        desc: "ค้นหาบทคัดย่อ (Oral และ Poster) ที่ผ่านการพิจารณาและอนุมัติแล้วสำหรับการนำเสนอในงานวิชาการ PRIS 2026",
        searchPlaceholder: "ค้นหาจากรหัส ชื่อผลงาน ผู้นำเสนอ หรือ สถาบัน...",
        approvedBadge: "Approved",
        emptyTitle: "ไม่พบรายการที่ตรงกับคำค้นหา",
        emptyDesc: "ลองใช้คำค้นหาอื่น หรือลบคำค้นหาเพื่อดูรายการทั้งหมด",
        presenterField: "ผู้นำเสนอ",
        institutionField: "สถาบัน",
        oralPresentation: "Oral",
        posterPresentation: "Poster",
        totalResults: "รายการ",
        showMore: "ดูชื่อเต็ม",
        showLess: "ย่อ",
      }
    : {
        eyebrow: "Abstract Search",
        title1: "Approved",
        title2: "Abstracts",
        desc: "Search PRIS 2026 abstracts (Oral and Poster) that have been successfully approved for presentation.",
        searchPlaceholder: "Search by ID, title, presenter, or institution...",
        approvedBadge: "Approved",
        emptyTitle: "No matching abstracts found",
        emptyDesc: "Try another keyword or clear the search to see all approved abstracts.",
        presenterField: "Presenter",
        institutionField: "Institution",
        oralPresentation: "Oral",
        posterPresentation: "Poster",
        totalResults: "results",
        showMore: "Show full title",
        showLess: "Collapse",
      };

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const filteredPosters = approvedPosterAbstracts.filter((poster) => {
    if (!normalizedQuery) return true;

    return [poster.id, poster.title, poster.presenter, poster.affiliation, poster.presentationType]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      
      {/* ══════ COMPACT HERO — optimised for 16:9 kiosk ══════ */}
      <section
        ref={heroRef}
        className="relative px-4 pt-8 pb-6 flex flex-col items-center text-center overflow-visible
                   sm:px-6 sm:pt-12 sm:pb-8
                   md:px-12 md:pt-16 md:pb-10"
      >
        {/* decorative bg glows */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[120px] pointer-events-none sm:w-[700px] sm:h-[700px] sm:blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/[0.04] rounded-full blur-[100px] pointer-events-none sm:w-[500px] sm:h-[500px] sm:blur-[150px]" />

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          <div className="hero-sub flex items-center gap-2 mb-3 sm:gap-4 sm:mb-5">
            <span className="h-px w-6 bg-blue-600 sm:w-12" />
            <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-blue-600 sm:text-[10px] sm:tracking-[0.3em]">PRIS 2026</span>
            <span className="text-gray-400 text-[8px] tracking-[0.18em] uppercase sm:text-[10px] sm:tracking-widest">— {copy.eyebrow}</span>
          </div>

          <h1 className="px-1 text-[2rem] font-black uppercase tracking-tighter leading-tight text-gray-900
                         sm:text-5xl md:text-7xl lg:text-[6rem]">
            <div className="overflow-hidden py-2 -my-2 md:pl-2">
              <span className="block hero-line pr-[0.15em]">{copy.title1}</span>
            </div>
            <div className="overflow-hidden py-2 -my-2 md:pl-2">
              <span className="block hero-line text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500 pb-2 pr-[0.15em]">
                {copy.title2}
              </span>
            </div>
          </h1>
          
          <p className="hero-sub mt-2 max-w-xl text-xs text-gray-500 font-light leading-relaxed px-2
                        sm:mt-4 sm:max-w-2xl sm:text-sm sm:px-0 md:text-base">
            {copy.desc}
          </p>
        </div>
      </section>

      {/* ══════ SEARCH & GRID — 16:9 optimised layout ══════ */}
      <section className="relative px-4 pb-12 sm:px-6 sm:pb-16 md:pb-20">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Search Bar */}
          <div className="relative z-20 mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                         sm:mb-8 sm:rounded-2xl">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400 sm:left-6 sm:size-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full bg-white py-3 pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:bg-gray-50/50
                          sm:py-4 sm:pl-14 sm:pr-6 sm:text-base"
              />
            </div>
          </div>

          {/* Results count */}
          {normalizedQuery && (
            <p className="mb-3 text-xs text-gray-400 font-medium tracking-wide sm:mb-4 sm:text-sm">
              {filteredPosters.length} {copy.totalResults}
            </p>
          )}

          {filteredPosters.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-4">
              {filteredPosters.map((poster, index) => (
                <PosterCard
                  key={poster.id}
                  poster={poster}
                  index={index}
                  copy={copy}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-5 py-12 text-center
                           sm:mt-10 sm:rounded-3xl sm:px-6 sm:py-20">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                             sm:mb-6 sm:size-16">
                <FileText className="size-6 sm:size-7" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">{copy.emptyTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 sm:mt-4 sm:text-base">
                {copy.emptyDesc}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════
   POSTER CARD — with 2-line title clamp + expand dropdown
   ══════════════════════════════════════════════════════ */
function PosterCard({
  poster,
  index,
  copy,
}: {
  poster: ApprovedPosterAbstract;
  index: number;
  copy: PageCopy;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Detect if the title text overflows 2 lines
  const checkClamp = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    // scrollHeight > clientHeight means content is clamped
    setIsClamped(el.scrollHeight > el.clientHeight + 2);
  }, []);

  useEffect(() => {
    checkClamp();
    window.addEventListener("resize", checkClamp);
    return () => window.removeEventListener("resize", checkClamp);
  }, [checkClamp]);

  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300
                 sm:rounded-2xl sm:p-5
                 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-blue-200"
    >
      {/* Type Marker (Oral vs Poster) */}
      <div 
        className={cn(
          "absolute top-0 right-0 z-10 rounded-bl-lg px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.15em] shadow-sm transition-colors",
          "sm:rounded-bl-xl sm:px-3.5 sm:py-1.5 sm:text-[9px] sm:tracking-[0.2em]",
          poster.presentationType === "Oral" 
            ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white" 
            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        )}
      >
        {poster.presentationType === "Oral" ? copy.oralPresentation : copy.posterPresentation}
      </div>

      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Background number */}
      <div className="pointer-events-none absolute bottom-2 right-3 text-[2rem] font-black tracking-tighter leading-none text-gray-50/80 group-hover:text-blue-50 transition-colors duration-300
                     sm:bottom-3 sm:right-4 sm:text-[3.5rem]">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="relative z-10">
        {/* Badge row */}
        <div className="mb-1 flex flex-wrap items-center gap-2 pr-14 sm:mb-1.5 sm:gap-3 sm:pr-20">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-gray-600
                          sm:px-2.5 sm:text-[9px]">
            {copy.approvedBadge}
          </span>
          <p className="font-mono text-[9px] font-semibold tracking-widest text-blue-600 sm:text-[10px]">{poster.id}</p>
        </div>

        {/* Title — clamped to 2 lines */}
        <h2
          ref={titleRef}
          className={cn(
            "mt-2 text-sm font-bold leading-snug tracking-tight text-gray-900 transition-all duration-300",
            "sm:mt-3 sm:text-base",
            !isExpanded && "line-clamp-2"
          )}
        >
          {poster.title}
        </h2>

        {/* Expand / Collapse toggle — only shows when title overflows */}
        {(isClamped || isExpanded) && (
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors 
                       sm:text-xs sm:mt-1.5"
          >
            <span>{isExpanded ? copy.showLess : copy.showMore}</span>
            <ChevronDown className={cn("size-3 transition-transform duration-200 sm:size-3.5", isExpanded && "rotate-180")} />
          </button>
        )}

        {/* Info rows */}
        <div className="mt-3 grid gap-2 border-t border-gray-100 pt-2.5
                       sm:gap-3 sm:grid-cols-2 sm:pt-3 sm:mt-4">
          <InfoRow icon={<User className="size-3 sm:size-3.5" />} label={copy.presenterField} value={poster.presenter} />
          <InfoRow
            icon={<Building2 className="size-3 sm:size-3.5" />}
            label={copy.institutionField}
            value={poster.affiliation}
          />
        </div>
      </div>
    </article>
  );
}

function InfoRow({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex items-center gap-1.5">
        <div className="text-blue-400">{icon}</div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-gray-400 sm:text-[9px] sm:tracking-[0.2em]">{label}</p>
      </div>
      <p className="pl-4 text-[11px] font-medium leading-relaxed text-gray-800 sm:pl-5 sm:text-xs">{value}</p>
    </div>
  );
}