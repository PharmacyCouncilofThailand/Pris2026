"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";

// ข้อมูลสปอนเซอร์แบบแบ่งตามระดับ (Sponsor Tiers) เพื่อจัด Layout
const sponsorTiers = [
  {
    tier: "Platinum Sponsors",
    sponsors: [
      { id: 1, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png" },
      { id: 2, name: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย", logo: "/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png" },
    ]
  },
  {
    tier: "Gold Sponsors",
    sponsors: [
      { id: 3, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
      { id: 4, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
      { id: 5, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    ]
  }
];

export default function SponsorshipPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("sponsorship");

  useGSAP(() => {


    // Sponsor blocks fade in
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
      <PageHero
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("intro")}
      />

      {/* ══════ SPONSOR LOGOS ══════ */}
      <section className="relative px-6 md:px-12 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-10 md:mb-14 content-block">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37]">
              PARTNER
            </h2>
          </div>

          {sponsorTiers.map((tierData, index) => (
            <div key={index} className="content-block mb-14 last:mb-0">
              <div className="flex flex-col items-center text-center mb-8">
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gray-400 mb-4">
                  {t("tierLabel")} {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-gray-900 mb-6 pb-4 border-b border-gray-200">
                  {tierData.tier}
                </h2>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
                {tierData.sponsors.map((sponsor) => (
                  <div 
                    key={sponsor.id} 
                    className="relative flex items-center justify-center w-40 h-24 md:w-56 md:h-32"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="object-contain w-full h-full max-w-[80%] max-h-[80%]"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ══════ BECOME A SPONSOR CTA ══════ */}
      <section className="relative px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto content-block text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="w-12 h-px bg-orange-500" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-orange-500">{t("cta.pretitle")}</span>
            <span className="w-12 h-px bg-orange-500" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-gray-900 mb-8">
            {t("cta.title")}
          </h2>
          <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed mb-12 max-w-2xl mx-auto">
            {t("cta.desc")}
          </p>
          <div className="flex justify-center">
            <a
              href="https://sponsor-wine.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white font-bold px-10 py-4 text-center uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors"
            >
              {t("cta.btn")}
            </a>
          </div>
        </div>
      </section>


    </main>
  );
}
