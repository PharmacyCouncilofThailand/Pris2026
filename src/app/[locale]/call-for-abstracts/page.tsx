"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/routing";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";

// Dynamic imports for the sections
const AbstractTimeline = dynamic(() => import("@/components/sections/AbstractTimeline"), { ssr: false });
const AbstractTopicList = dynamic(() => import("@/components/sections/AbstractTopicList"), { ssr: false });
const AbstractGuidelines = dynamic(() => import("@/components/sections/AbstractGuidelines"), { ssr: false });
    

export default function CallForAbstractsPage() {
  const t = useTranslations("cfa");

  React.useEffect(() => {
    document.body.classList.remove("hero-playing");
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* ══════ HERO ══════ */}
      <PageHero
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("ctaDesc")}
      />

      {/* ── Content Sections ── */}
      <div>
        <AbstractTimeline />
        <AbstractTopicList />
        <AbstractGuidelines />
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
              className="bg-blue-600 text-white font-bold px-8 py-4 rounded-full text-center uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors"
            >
              {t("submitAbstract")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
