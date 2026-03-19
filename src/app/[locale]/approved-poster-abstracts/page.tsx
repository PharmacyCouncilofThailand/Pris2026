"use client";

import { useDeferredValue, useState, useEffect, useRef, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Building2, FileText, Search, User } from "lucide-react";
import { approvedPosterAbstracts, type ApprovedPosterAbstract } from "@/data/approvedPosterAbstracts";
import { cn } from "@/lib/utils";
import gsap from "gsap";

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
};

export default function ApprovedPosterAbstractsPage() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const heroRef = useRef<HTMLElement>(null!);

  useEffect(() => {
    document.body.classList.remove("hero-playing");

    const ctx = gsap.context(() => {
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
    }, heroRef);

    return () => ctx.revert();
  }, []);

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
        oralPresentation: "Oral Presentation",
        posterPresentation: "Poster Presentation",
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
        oralPresentation: "Oral Presentation",
        posterPresentation: "Poster Presentation",
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
      
      {/* ══════ HERO ══════ */}
      <section
        ref={heroRef}
        className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-12 flex flex-col justify-end items-center text-center overflow-visible"
      >
        {/* decorative bg glows */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-500/[0.04] rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/[0.04] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          <div className="hero-sub flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-blue-600" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">PRIS 2026</span>
            <span className="text-gray-400 text-[10px] tracking-widest uppercase">— {copy.eyebrow}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] text-gray-900">
            <div className="overflow-hidden">
              <span className="block hero-line">{copy.title1}</span>
            </div>
            <div className="overflow-hidden py-2" >
              <span className="block hero-line text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500 pb-2">
                {copy.title2}
              </span>
            </div>
          </h1>
          
          <p className="hero-sub mt-8 max-w-2xl text-lg text-gray-500 font-light leading-relaxed">
            {copy.desc}
          </p>
        </div>
      </section>

      {/* ══════ SEARCH & LIST ══════ */}
      <section className="relative px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          
          {/* Search Bar - Full Width */}
          <div className="rounded-[2rem] border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-20 -mt-8 mb-16 overflow-hidden">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-6 top-1/2 size-6 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full bg-white py-6 pl-16 pr-6 text-lg font-medium text-gray-700 outline-none transition placeholder:text-gray-400 focus:bg-gray-50/50"
              />
            </div>
          </div>

          {filteredPosters.length > 0 ? (
            <div className="grid gap-8 xl:grid-cols-2">
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
            <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-28 text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white text-gray-400 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-6">
                <FileText className="size-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">{copy.emptyTitle}</h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
                {copy.emptyDesc}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PosterCard({
  poster,
  index,
  copy,
}: {
  poster: ApprovedPosterAbstract;
  index: number;
  copy: PageCopy;
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-8 md:p-10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-blue-200"
    >
      {/* Type Marker (Oral vs Poster) at Top Right */}
      <div 
        className={cn(
          "absolute top-0 right-0 rounded-bl-3xl px-6 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-sm z-10 transition-colors",
          poster.presentationType === "Oral" 
            ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white" 
            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        )}
      >
        {poster.presentationType === "Oral" ? copy.oralPresentation : copy.posterPresentation}
      </div>

      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-500 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="pointer-events-none absolute bottom-5 right-6 text-[5rem] md:text-[6.5rem] font-black tracking-tighter leading-none text-gray-50/80 group-hover:text-blue-50 transition-colors duration-300">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            {copy.approvedBadge}
          </span>
          <p className="font-mono text-xs font-semibold tracking-widest text-blue-600">{poster.id}</p>
        </div>

        <h2 className="mt-6 mb-10 max-w-xl text-xl font-bold leading-snug tracking-tight text-gray-900 md:text-2xl lg:text-[1.65rem]">
          {poster.title}
        </h2>

        <div className="mt-auto pt-6 border-t border-gray-50/80 grid gap-6 sm:grid-cols-2">
          <InfoRow icon={<User className="size-4" />} label={copy.presenterField} value={poster.presenter} />
          <InfoRow
            icon={<Building2 className="size-4" />}
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        <div className="text-blue-400">{icon}</div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">{label}</p>
      </div>
      <p className="text-sm font-medium leading-relaxed text-gray-800 ml-6">{value}</p>
    </div>
  );
}