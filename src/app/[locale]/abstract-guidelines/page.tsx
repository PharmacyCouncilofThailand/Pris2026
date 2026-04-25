"use client";

import React, { useRef, useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { submissionGuidelines } from "@/data/abstractData";
import gsap from "gsap";
import { useTranslations, useLocale } from "next-intl";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PageHero from "@/components/sections/PageHero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DetailedGuidelines() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const t = useTranslations("abstractGuidelines");
  const locale = useLocale();
  const importantDatesReservationNote =
    locale === "th"
      ? submissionGuidelines.importantDatesReservationNoteTh
      : submissionGuidelines.importantDatesReservationNote;
  const importantDatesReviewNote =
    locale === "th"
      ? submissionGuidelines.presenterRegistrationNoteTh
      : submissionGuidelines.presenterRegistrationNote;

  useEffect(() => {
    // Set current date on the client side to avoid hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date());
  }, []);

  useGSAP(() => {


    // Content blocks fade in
    const blocks = pageRef.current?.querySelectorAll(".content-block");
    blocks?.forEach((block) => {
      gsap.fromTo(
        block,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: block,
            start: "top 85%",
          },
        }
      );
    });
  }, { scope: pageRef });

  return (
    <main
      ref={pageRef}
      className="bg-white text-gray-900 overflow-hidden selection:bg-blue-500/20 min-h-screen"
    >


      {/* ══════ HERO ══════ */}
      <PageHero
        eyebrowSub={t("heroSub")}
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("desc")}
      />

      {/* INTRO */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-4xl mx-auto content-block">
          <p className="text-gray-500 text-base md:text-lg leading-[1.8] font-light">
            {locale === "th" ? submissionGuidelines.introTh : submissionGuidelines.intro}
          </p>
        </div>
      </section>

      {/* IMPORTANT DATES */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">
          <div className="content-block mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-blue-600" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">{t("timelineLabel")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {t("timelineTitle")}
            </h2>
          </div>

          <div className="content-block border-t border-gray-200">
            {submissionGuidelines.importantDates.map((item, idx) => {
              let isPastOrCurrent = false;
              if (currentDate) {
                const itemDate = new Date(item.value);
                isPastOrCurrent = currentDate.getTime() >= itemDate.getTime();
              }
              const isHighlighted = item.highlight || isPastOrCurrent;

              return (
                <div
                  key={idx}
                  className="flex flex-col gap-1 border-b border-gray-200 py-5 md:flex-row md:items-baseline md:gap-8 transition-colors duration-300 hover:bg-gray-50/50"
                >
                  <span className={`text-lg transition-colors duration-300 md:w-[55%] ${isHighlighted ? "text-red-600 font-bold" : "text-gray-900 font-medium"}`}>
                    {locale === "th" && item.labelTh ? item.labelTh : item.label}
                  </span>
                  <span className={`text-sm transition-colors duration-300 ${isHighlighted ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    {locale === "th" && item.valueTh ? item.valueTh : item.value}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="content-block mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {locale === "th" ? "หมายเหตุการพิจารณา" : "Review Note"}
            </p>
            <p className="text-sm leading-relaxed text-slate-600 md:text-[0.95rem]">
              {importantDatesReviewNote}
            </p>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-red-700 md:text-[0.95rem]">
              {importantDatesReservationNote}
            </p>
          </div>
        </div>
      </section>

      {/* ══════ GENERAL INFORMATION ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">

          <div className="content-block mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-blue-600" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">{t("overviewLabel")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {t("overviewTitle")}
            </h2>
          </div>

          <div className="content-block border-t border-gray-200">
            {submissionGuidelines.generalInformation.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-8 py-5 border-b border-gray-200"
              >
                <span className="text-gray-900 font-medium text-base md:w-[45%]">{locale === "th" && item.labelTh ? item.labelTh : item.label}</span>
                <span className="text-gray-500 text-sm md:text-base">{locale === "th" && item.valueTh ? item.valueTh : item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ ABSTRACT TOPICS ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">

          <div className="content-block mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-orange-500" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-orange-500">{t("categoriesLabel")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {t("categoriesTitle")}
            </h2>
          </div>

          <div className="content-block border-t border-gray-200">
            {(locale === "th" ? submissionGuidelines.abstractTopicsTh : submissionGuidelines.abstractTopics).map((topic, idx) => (
              <div
                key={idx}
                className="flex items-baseline gap-6 py-5 border-b border-gray-200 hover:bg-gray-50/60 transition-colors"
              >
                <span className="text-orange-500 text-xs font-bold tracking-widest w-8 shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-gray-900 font-medium text-lg">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ SUBMISSION GUIDELINES ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">

          <div className="content-block mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-blue-600" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">{t("rulesLabel")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {t("rulesTitle")}
            </h2>
          </div>

          <div className="content-block border-t border-gray-200">
            {(locale === "th" ? submissionGuidelines.guidelinesTh : submissionGuidelines.guidelines).map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-6 py-5 border-b border-gray-100"
              >
                <span className="text-gray-300 text-xs font-bold tracking-widest w-8 shrink-0 pt-1">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="text-gray-600 text-base leading-relaxed font-light">{rule}</p>
              </div>
            ))}
          </div>

          {/* Callout notes */}
          <div className="content-block mt-12 space-y-6 max-w-4xl">
            <div className="border-l-2 border-blue-400 pl-6 py-2">
              <p className="text-gray-500 text-sm leading-relaxed">{locale === "th" ? submissionGuidelines.acknowledgementNoteTh : submissionGuidelines.acknowledgementNote}</p>
            </div>
            <div className="border-l-2 border-orange-400 pl-6 py-2">
              <p className="text-gray-500 text-sm leading-relaxed">{locale === "th" ? submissionGuidelines.reviewNoteTh : submissionGuidelines.reviewNote}</p>
            </div>
            <div className="border-l-2 border-red-400 pl-6 py-2">
              <p className="text-red-600 text-sm font-medium leading-relaxed">{locale === "th" ? submissionGuidelines.noMediaNoteTh : submissionGuidelines.noMediaNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ ABSTRACT STRUCTURE ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">

          <div className="content-block mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-orange-500" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-orange-500">{t("formatLabel")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {t("formatTitle")}
            </h2>
          </div>

          <div className="content-block max-w-4xl">
            <p className="text-gray-500 text-base leading-[1.8] font-light mb-12">
              {locale === "th" ? "บทคัดย่อต้องมีโครงสร้างตามหัวข้อต่อไปนี้:" : "Abstracts must be structured and include the following sections:"}
            </p>
          </div>

          <div className="content-block border-t border-gray-200">
            {submissionGuidelines.abstractStructure.map((item, idx) => (
              <div
                key={idx}
                className="py-6 border-b border-gray-200"
              >
                <div className="flex items-baseline gap-6">
                  <span className="text-orange-500 text-xs font-bold tracking-widest w-8 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="text-gray-900 font-medium text-lg">{locale === "th" && item.titleTh ? item.titleTh : item.title}</span>
                    {(locale === "th" ? item.descTh : item.desc) && (
                      <span className="text-gray-400 text-sm ml-3">— {locale === "th" ? item.descTh : item.desc}</span>
                    )}
                  </div>
                </div>
                {(locale === "th" ? item.itemsTh : item.items) && (
                  <div className="ml-14 mt-3 space-y-2">
                    {(locale === "th" ? item.itemsTh : item.items)?.map((sub, subIdx) => (
                      <p key={subIdx} className="text-gray-500 text-sm font-light flex items-start gap-3">
                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0 mt-2" />
                        {sub}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WORD LIMIT ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto content-block">
          <div className="border-t border-b border-gray-200 py-12 md:py-16 text-center">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-orange-500 block mb-4">{locale === "th" ? "จำกัดจำนวนคำไม่เกิน" : "Maximum Word Limit"}</span>
            <p className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 uppercase">
              {locale === "th" ? submissionGuidelines.maxWordLimitTh : submissionGuidelines.maxWordLimit}
            </p>
          </div>
        </div>
      </section>

      {/* ══════ FORMATTING ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">

          <div className="content-block mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-blue-600" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">{locale === "th" ? "การจัดรูปแบบเอกสาร" : "Typography"}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {locale === "th" ? "รูปแบบ" : "Formatting"}
            </h2>
          </div>

          <div className="content-block border-t border-gray-200">
            {(locale === "th" ? submissionGuidelines.formattingTh : submissionGuidelines.formatting).map((item, idx) => (
              <div
                key={idx}
                className="flex items-baseline gap-6 py-5 border-b border-gray-200"
              >
                <span className="text-blue-600 text-xs font-bold tracking-widest w-8 shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-gray-700 font-medium text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ DECLARATION & ACCEPTANCE ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">

          <div className="content-block mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-px bg-blue-600" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">{locale === "th" ? "นโยบาย" : "Policies"}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {locale === "th" ? "นโยบาย" : "Policies"}
            </h2>
          </div>

          {/* Declaration */}
          <div className="content-block mb-16">
            <h3 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 mb-6">{locale === "th" ? "การรับรองและการมอบสิทธิ์" : "Declaration & Assignation"}</h3>
            <div className="border-t border-gray-200">
              {(locale === "th" ? submissionGuidelines.policies.declarationTh : submissionGuidelines.policies.declaration).map((item, idx) => (
                <div key={idx} className="flex items-start gap-6 py-5 border-b border-gray-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-2" />
                  <p className="text-gray-600 text-base leading-relaxed font-light">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance */}
          <div className="content-block mb-16">
            <h3 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 mb-6">{locale === "th" ? "การแจ้งผลการพิจารณา" : "Acceptance Notification"}</h3>
            <div className="border-t border-gray-200">
              {(locale === "th" ? submissionGuidelines.policies.acceptanceTh : submissionGuidelines.policies.acceptance).map((item, idx) => (
                <div key={idx} className="flex items-start gap-6 py-5 border-b border-gray-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                  <p className={`text-base leading-relaxed font-light ${idx === (locale === "th" ? submissionGuidelines.policies.acceptanceTh : submissionGuidelines.policies.acceptance).length - 1 ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawal */}
          <div className="content-block">
            <h3 className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 mb-6">{locale === "th" ? "การถอนบทคัดย่อ" : "Abstract Withdrawal"}</h3>
            <div className="border-t border-b border-gray-200 py-6">
              <p className="text-gray-600 text-base leading-relaxed font-light">
                {locale === "th" ? submissionGuidelines.policies.withdrawalTh : submissionGuidelines.policies.withdrawal}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="py-24 md:py-32 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
            {t("ctaTitle1")} <span className="text-blue-600">{t("ctaTitle2")}</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-12">
            {t("ctaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/abstract-submission"
              className="bg-blue-600 text-white font-bold px-8 py-4 uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors"
            >
              {t("submitBtn")}
            </Link>
            <Link
              href="/call-for-abstracts"
              className="bg-white text-slate-900 font-bold px-8 py-4 uppercase tracking-widest text-sm border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              {t("backBtn")}
            </Link>
          </div>
        </div>
      </section>


    </main>
  );
}
