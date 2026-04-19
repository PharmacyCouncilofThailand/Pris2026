"use client";

import React, { useRef } from "react";
import { Link } from "@/i18n/routing";
import { policyFaqs } from "@/data/policyData";
import { Download } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { useTranslations, useLocale } from "next-intl";

export default function RegistrationPolicies() {
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("registrationPolicies");
  const locale = useLocale();

  useGSAP(() => {
    // Hero text reveal
    gsap.from(".policy-hero-line", {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.6,
      ease: "power4.out",
      delay: 0.15,
    });
    gsap.from(".policy-hero-sub", {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power3.out",
      delay: 0.6,
    });

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
      className="bg-white text-gray-900 overflow-hidden selection:bg-orange-500/20 min-h-screen"
    >


      {/* ══════ HERO ══════ */}
      <section className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-12 flex flex-col justify-end items-center text-center">
        {/* decorative bg glows */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-500/[0.06] rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/[0.06] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          <div className="overflow-hidden mb-6 flex justify-center">
            <h4 className="policy-hero-sub text-blue-600 tracking-[0.3em] uppercase text-xs md:text-sm font-semibold flex items-center gap-4">
              <span className="w-8 h-px bg-blue-600/50" />
              {t("pretitle")}
              <span className="w-8 h-px bg-blue-600/50" />
            </h4>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black uppercase tracking-tighter leading-[0.85] text-gray-900 mb-8">
            <div className="overflow-hidden md:pl-2">
              <span className="block policy-hero-line pr-[0.15em]">{t("title1")}</span>
            </div>
            <div className="overflow-hidden md:pl-2">
              <span className="block policy-hero-line text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500 pr-[0.15em]">
                {t("title2")}
              </span>
            </div>
          </h1>

          <div className="overflow-hidden max-w-2xl px-4">
            <p className="policy-hero-sub text-gray-500 text-lg md:text-xl font-light leading-relaxed">
              {t("intro")}
            </p>
          </div>
        </div>
      </section>

      {/* ══════ INTRO ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-4xl mx-auto content-block text-center border-t border-b border-gray-200 py-12 md:py-16">
          <p className="text-gray-600 text-base md:text-lg leading-[1.8] font-light">
            {t("intro")} <a href="mailto:pharthai@pharmacycouncil.org" className="text-blue-600 font-medium hover:underline">pharthai@pharmacycouncil.org</a>
          </p>
        </div>
      </section>

      {/* ══════ POLICY DETAILS ══════ */}
      <section className="relative px-6 md:px-12 pb-28 md:pb-40">
        <div className="max-w-6xl mx-auto">

          {/* Payment Method */}
          <div className="content-block mb-24 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-gray-900 mb-8 pb-4 border-b border-gray-200">
              {t("paymentMethod.title")}
            </h2>
            <div className="space-y-4 text-gray-600 font-light leading-relaxed">
              <p>{t("paymentMethod.text1")}</p>
              <ul className="list-none space-y-3 mt-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-2" />
                  <span>{t("paymentMethod.text2")}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Confirmation of Registration */}
          <div className="content-block mb-24 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-gray-900 mb-8 pb-4 border-b border-gray-200">
              {t("confirmation.title")}
            </h2>
            <ul className="list-none space-y-4 text-gray-600 font-light leading-relaxed">
              {t.raw("confirmation.items").map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cancellations & Refund Policy */}
          <div className="content-block mb-24 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-gray-900 mb-8 pb-4 border-b border-gray-200">
              {t("cancellation.title")}
            </h2>
            <div className="space-y-6 text-gray-600 font-light leading-relaxed">
              <ul className="list-none space-y-4 mb-8">
                {t.raw("cancellation.items").map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Refund Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-5 font-bold text-sm tracking-widest uppercase text-gray-900 w-1/2">{t("cancellation.table.th1")}</th>
                      <th className="p-5 font-bold text-sm tracking-widest uppercase text-gray-900 w-1/2 border-l border-gray-200">{t("cancellation.table.th2")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 text-gray-700 font-medium">{t("cancellation.table.r1c1")}</td>
                      <td className="p-5 text-gray-600 border-l border-gray-100">{t("cancellation.table.r1c2")}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 text-gray-700 font-medium">{t("cancellation.table.r2c1")}</td>
                      <td className="p-5 text-gray-600 border-l border-gray-100">{t("cancellation.table.r2c2")}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 text-gray-700 font-medium">{t("cancellation.table.r3c1")}</td>
                      <td className="p-5 text-gray-600 border-l border-gray-100 font-semibold text-orange-600">{t("cancellation.table.r3c2")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Download Button */}
              <div className="mt-12 text-center pt-6">
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 font-medium px-8 py-4 uppercase tracking-widest text-sm rounded cursor-not-allowed border border-gray-200"
                >
                  <Download className="w-4 h-4" />
                  {t("cancellation.downloadBtn")}
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════ FAQS ══════ */}
      <section className="relative px-6 md:px-12 pb-32 md:pb-44">
        <div className="max-w-4xl mx-auto">
          <div className="content-block mb-16 md:mb-20 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="w-12 h-px bg-orange-500" />
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-orange-500">{t("faq.pretitle")}</span>
              <span className="w-12 h-px bg-orange-500" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-gray-900">
              {t("faq.title")}
            </h2>
          </div>

          <div className="content-block border-t border-gray-200">
            {policyFaqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-200 py-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{locale === "th" && (faq as Record<string, string>).questionTh ? (faq as Record<string, string>).questionTh : faq.question}</h3>
                <p className="text-gray-600 font-light leading-relaxed">{locale === "th" && (faq as Record<string, string>).answerTh ? (faq as Record<string, string>).answerTh : faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="content-block mt-16 text-center">
            <Link
              href="/"
              className="inline-block border border-gray-300 text-gray-600 font-bold px-10 py-4 uppercase tracking-widest text-sm hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              {t("faq.backBtn")}
            </Link>
          </div>
        </div>
      </section>


    </main>
  );
}
