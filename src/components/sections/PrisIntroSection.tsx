"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}


export default function PrisIntroSection() {
  const t = useTranslations("prisIntro");
  const locale = useLocale();
  const containerRef = useRef<HTMLElement>(null);

  const titleSegments = (() => {
    const title = t("title");

    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      return Array.from(
        new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(title),
        ({ segment }) => segment
      );
    }

    return Array.from(title);
  })();

  useGSAP(
    () => {
      // ── Title chars stagger ──
      gsap.fromTo(
        ".pris-char",
        { y: "110%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1.4,
          stagger: 0.04,
          ease: "expo.out",
          scrollTrigger: { trigger: ".pris-title", start: "top 82%" },
        }
      );

      // ── Body paragraphs ──
      gsap.fromTo(
        ".pris-body",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".pris-body-wrap", start: "top 82%" },
        }
      );

      // ── Stat counters ──
      gsap.fromTo(
        ".pris-stat",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".pris-stats", start: "top 85%" },
        }
      );


      // ── Decorative line draw ──
      gsap.utils.toArray<HTMLElement>(".pris-line").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.4,
            ease: "power4.inOut",
            transformOrigin: "left center",
            scrollTrigger: { trigger: line, start: "top 90%" },
          }
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative bg-white text-black py-28 md:py-40 overflow-hidden selection:bg-[#0055FF] selection:text-white"
    >
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-[1600px] relative">
        {/* ── TITLE ── */}
        <div className="pris-title overflow-hidden mb-16 md:mb-24">
          <h2 className="text-[clamp(3rem,8vw,10rem)] leading-[0.85] font-black tracking-tighter uppercase">
            {titleSegments.map((char, i) => (
                <span key={i} className="pris-char inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
          </h2>
        </div>

        {/* ── BODY: Two-column editorial ── */}
        <div className="pris-body-wrap grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 mb-20 md:mb-32">
          <div>
            <p
              className="pris-body text-xl md:text-2xl lg:text-3xl font-light leading-[1.5] tracking-tight text-black/80"
              dangerouslySetInnerHTML={{ __html: t.raw("intro") }}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="pris-body text-base md:text-lg leading-[1.8] text-black/50 font-light">
              {t("body")}
            </p>
          </div>
        </div>

        <div className="pris-line w-full h-px bg-black/10" />

        {/* ── STATS ROW ── */}
        <div className="pris-stats grid grid-cols-1 sm:grid-cols-3 gap-0 my-16 md:my-24">
          {/* Stat 1: Participants */}
          <div className="pris-stat group border-b sm:border-b-0 sm:border-r border-black/10 py-10 sm:py-14 sm:pr-12 last:border-0">
            <p className="text-[clamp(3rem,6vw,5.5rem)] font-black tracking-tighter leading-none text-black group-hover:text-[#FF5A00] transition-colors duration-500">
              {t("stat1Value")}
            </p>
            <p className="mt-4 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-black/40 group-hover:text-black/60 transition-colors duration-500">
              {t("stat1Label")}
            </p>
          </div>

          {/* Stat 2: Booths */}
          <div className="pris-stat group border-b sm:border-b-0 sm:border-r border-black/10 py-10 sm:py-14 sm:px-12 last:border-0">
            <p className="text-[clamp(3rem,6vw,5.5rem)] font-black tracking-tighter leading-none text-black group-hover:text-[#0055FF] transition-colors duration-500">
              {t("stat2Value")}
            </p>
            <p className="mt-4 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-black/40 group-hover:text-black/60 transition-colors duration-500">
              {t("stat2Label")}
            </p>
          </div>

          {/* Stat 3: Networking */}
          <div className="pris-stat group py-10 sm:py-14 sm:pl-12 border-b sm:border-b-0 border-black/10 last:border-0">
            <p className="text-[clamp(3rem,6vw,5.5rem)] font-black tracking-tighter leading-none text-black group-hover:text-[#FF5A00] transition-colors duration-500">
              {t("stat3Value")}
            </p>
            <p className="mt-4 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-black/40 group-hover:text-black/60 transition-colors duration-500">
              {t("stat3Label")}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
