"use client";

import { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import CountUp from "@/components/ui/CountUp";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


export default function PrisIntroSection() {
  const t = useTranslations("prisIntro");
  const locale = useLocale();
  const containerRef = useRef<HTMLElement>(null);

  const titleSegments = useMemo(() => {
    const title = t("title");

    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      return Array.from(
        new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(title),
        ({ segment }) => segment
      );
    }

    return Array.from(title);
  }, [t, locale]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        // ── Title chars stagger (No scrub, simple play on scroll) ──
        gsap.fromTo(
          ".pris-char",
          { y: "120%" },
          {
            y: "0%",
            ease: "power3.out",
            duration: 0.8,
            stagger: 0.02,
            force3D: true, // Make sure GPU acceleration is forced
            scrollTrigger: { 
              trigger: ".pris-title", 
              start: "top 85%", 
              toggleActions: "play none none reverse" // Removed aggressive mid-screen reversing
            },
          }
        );

        // ── Body paragraphs (No scrub) ──
        gsap.fromTo(
          ".pris-body-line",
          { y: "120%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            ease: "power3.out",
            duration: 1,
            stagger: 0.1,
            force3D: true,
            scrollTrigger: { 
              trigger: ".pris-body-wrap", 
              start: "top 85%", 
              toggleActions: "play none none reverse"
            },
          }
        );

      });
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <>
    <section
      ref={containerRef}
      className="relative bg-white text-black pt-28 md:pt-40 pb-12 md:pb-16 overflow-hidden selection:bg-[#0055FF] selection:text-white"
    >
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] relative flex flex-col items-center text-center">
        
        {/* ── TITLE ── */}
        <div className="pris-title overflow-hidden py-4 -my-4 mb-10 md:mb-16 will-change-transform transform-gpu">
          <h2 className="text-[clamp(3rem,8vw,10rem)] leading-none font-black tracking-tighter uppercase pr-[0.15em]">
            {titleSegments.map((char, i) => (
                <span key={i} className="pris-char inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
          </h2>
        </div>

        {/* ── BODY: Centered Editorial ── */}
        <div className="pris-body-wrap max-w-4xl mx-auto flex flex-col gap-6 lg:gap-10 mb-16 md:mb-20 will-change-transform transform-gpu">
          <div className="overflow-hidden py-2 -my-2 flex justify-center">
            <p
              className="pris-body-line text-xl md:text-2xl lg:text-3xl font-light leading-[1.6] tracking-tight text-black/80 inline-block"
              dangerouslySetInnerHTML={{ __html: t.raw("intro") }}
            />
          </div>
          <div className="overflow-hidden py-2 -my-2 flex justify-center">
            <p className="pris-body-line text-base md:text-lg leading-[1.8] text-black/50 font-light max-w-2xl inline-block">
              {t("body")}
            </p>
          </div>
        </div>

        {/* ── STATS ROW: White ── */}
        <div className="pris-stats w-full grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-black/10">

          {/* Stat 1: Participants */}
          <div className="pris-stat group flex flex-col items-center text-center pt-14 pb-8 md:pt-20 md:pb-12 border-b sm:border-b-0 sm:border-r border-black/10">
            <p
              className="stat-number text-7xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7.5rem] font-black tracking-tighter leading-none text-black"
            >
              <CountUp text={t("stat1Value")} duration={2500} />
            </p>

            {/* Icon: Network/People */}
            <div className="mt-8 mb-5 w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full text-black/70">
                {/* Central person */}
                <circle cx="40" cy="24" r="5" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M33 38a7 7 0 0114 0" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                {/* Left person */}
                <circle cx="16" cy="34" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 45a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                {/* Right person */}
                <circle cx="64" cy="34" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M58 45a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                {/* Bottom left */}
                <circle cx="24" cy="60" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
                {/* Bottom right */}
                <circle cx="56" cy="60" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
                {/* Connection lines */}
                <line x1="36" y1="29" x2="20" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                <line x1="44" y1="29" x2="60" y2="34" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                <line x1="16" y1="49" x2="24" y2="56" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                <line x1="64" y1="49" x2="56" y2="56" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                <line x1="28" y1="60" x2="52" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.25" strokeDasharray="3 3"/>
                <line x1="40" y1="38" x2="40" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.25" strokeDasharray="3 3"/>
              </svg>
            </div>

            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              {t("stat1Label")}
            </p>
          </div>

          {/* Stat 2: Exhibition Booths */}
          <div className="pris-stat group flex flex-col items-center text-center pt-14 pb-8 md:pt-20 md:pb-12 border-b sm:border-b-0 sm:border-r border-black/10">
            <p
              className="stat-number text-7xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7.5rem] font-black tracking-tighter leading-none text-black"
            >
              <CountUp text={t("stat2Value")} duration={1500} />
            </p>

            {/* Icon: Exhibition Booth */}
            <div className="mt-8 mb-5 w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full text-black/70">
                {/* Canopy roof */}
                <path d="M18 24L40 12L62 24" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <line x1="18" y1="24" x2="62" y2="24" stroke="currentColor" strokeWidth="1.8"/>
                {/* Pillars */}
                <line x1="22" y1="24" x2="22" y2="56" stroke="currentColor" strokeWidth="1.8"/>
                <line x1="58" y1="24" x2="58" y2="56" stroke="currentColor" strokeWidth="1.8"/>
                {/* Counter */}
                <rect x="22" y="42" width="36" height="14" rx="1" stroke="currentColor" strokeWidth="1.6"/>
                {/* Person behind counter */}
                <circle cx="40" cy="33" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M35 42a5 5 0 0110 0" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                {/* Base */}
                <line x1="18" y1="56" x2="62" y2="56" stroke="currentColor" strokeWidth="1.8"/>
                {/* Legs */}
                <line x1="22" y1="56" x2="20" y2="64" stroke="currentColor" strokeWidth="1.4"/>
                <line x1="58" y1="56" x2="60" y2="64" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </div>

            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              {t("stat2Label")}
            </p>
          </div>

          {/* Stat 3: Networking Night */}
          <div className="pris-stat group flex flex-col items-center text-center pt-14 pb-8 md:pt-20 md:pb-12">
            <p
              className="stat-number text-7xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7.5rem] font-black tracking-tighter leading-none text-black"
            >
              <CountUp text={t("stat3Value")} duration={1000} />
            </p>

            {/* Icon: Wine glasses / Networking */}
            <div className="mt-8 mb-5 w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full text-black/70">
                {/* Board / Poster frame */}
                <rect x="20" y="16" width="40" height="32" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                {/* Title line */}
                <line x1="26" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Content lines inside poster */}
                <line x1="26" y1="30" x2="54" y2="30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <line x1="26" y1="36" x2="54" y2="36" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <line x1="26" y1="42" x2="46" y2="42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                {/* Stand legs */}
                <line x1="28" y1="48" x2="24" y2="64" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="52" y1="48" x2="56" y2="64" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                {/* Horizontal bar on stand */}
                <line x1="26" y1="56" x2="54" y2="56" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                {/* Decorative dots around */}
                <circle cx="14" cy="30" r="2" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                <circle cx="66" cy="30" r="2" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
                <circle cx="40" cy="68" r="2" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              </svg>
            </div>

            <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              {t("stat3Label")}
            </p>
          </div>

        </div>

      </div>
    </section>
    </>
  );
}
