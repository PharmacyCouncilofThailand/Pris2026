"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/routing";
import gsap from "gsap";
import { useTranslations } from "next-intl";

// Dynamic imports for the sections
const AbstractTimeline = dynamic(() => import("@/components/sections/AbstractTimeline"), { ssr: false });
const AbstractTopicList = dynamic(() => import("@/components/sections/AbstractTopicList"), { ssr: false });
const AbstractGuidelines = dynamic(() => import("@/components/sections/AbstractGuidelines"), { ssr: false });
const AbstractExamples = dynamic(() => import("@/components/sections/AbstractExamples"), { ssr: false });

export default function CallForAbstractsPage() {
  const heroRef = useRef<HTMLElement>(null!);
  const t = useTranslations("cfa");

  useEffect(() => {
    document.body.classList.remove("hero-playing");

    const ctx = gsap.context(() => {
      gsap.from(".cfa-hero-line", {
        yPercent: 110,
        stagger: 0.12,
        duration: 1.6,
        ease: "power4.out",
        delay: 0.15,
      });
      gsap.from(".cfa-hero-sub", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.8,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">

      {/* ══════ HERO ══════ */}
      <section
        ref={heroRef}
        className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-12 flex flex-col justify-end items-center text-center"
      >
        {/* decorative bg glows */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-500/[0.06] rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/[0.06] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          <div className="cfa-hero-sub flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-blue-600" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">PRIS 2026</span>
            <span className="text-gray-300 text-[10px] tracking-widest uppercase">— Call for Abstracts</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] text-gray-900">
            <div className="overflow-hidden">
              <span className="block cfa-hero-line">{t("title1")}</span>
            </div>
            <div className="overflow-hidden">
              <span className="block cfa-hero-line text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500">
                {t("title2")}
              </span>
            </div>
          </h1>
        </div>
      </section>

      {/* ── Content Sections ── */}
      <div>
        <AbstractTimeline />
        <AbstractTopicList />
        <AbstractGuidelines />
        <AbstractExamples />
      </div>

      {/* ── CTA Section ── */}
      <section className="py-24 md:py-32 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 font-outfit text-slate-900 tracking-tight">
            {t("ctaTitle1")} <span className="text-blue-600">{t("ctaTitle2")}</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed">
            {t("ctaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/abstract-submission"
              className="bg-blue-600 text-white font-bold px-8 py-4 text-center uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors"
            >
              {t("submitAbstract")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
