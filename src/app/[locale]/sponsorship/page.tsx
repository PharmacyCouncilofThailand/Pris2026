"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { useTranslations } from "next-intl";

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
    // Hero text reveal
    gsap.from(".sponsor-hero-line", {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.6,
      ease: "power4.out",
      delay: 0.15,
    });
    gsap.from(".sponsor-hero-sub", {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power3.out",
      delay: 0.6,
    });

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
      <section className="relative pt-36 md:pt-48 pb-12 md:pb-16 px-6 md:px-12 flex flex-col justify-end items-center text-center">
        {/* decorative bg glows */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-500/[0.06] rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/[0.06] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
          <div className="sponsor-hero-sub flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-blue-600" />
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-600">{t("pretitle")}</span>
            <span className="text-gray-300 text-[10px] tracking-widest uppercase">— {t("pretitleSub")}</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] font-black uppercase tracking-tighter leading-tight text-gray-900">
            <div className="overflow-hidden py-2 -my-2">
              <span className="block sponsor-hero-line">{t("title1")}</span>
            </div>
            <div className="overflow-hidden py-2 -my-2">
              <span className="block sponsor-hero-line text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-blue-500 to-blue-700 pb-2">
                {t("title2")}
              </span>
            </div>
          </h1>
        </div>
      </section>

      {/* ══════ INTRO ══════ */}
      <section className="relative px-6 md:px-12 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto content-block text-center border-t border-b border-gray-200 py-8 md:py-10">
          <p className="text-gray-500 text-base md:text-lg leading-[1.8] font-light max-w-2xl mx-auto">
            {t("intro")}
          </p>
        </div>
      </section>

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
