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

const organizedByLogos = [
  { id: 1, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png" },
  { id: 2, name: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย", logo: "/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png" },
];

const partnerLogos = [
  { id: 3, name: "วิทยาลัยเภสัชบำบัด", logo: "/assets/Img/sponsors/วิทยาลัยบำบัด 2.png" },
  { id: 4, name: "วิทยาลัยเภสัชกรรมอุตสาหการแห่งประเทศไทย", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมอุตสาหการแห่งประเทศไทย.png" },
  { id: 5, name: "วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย.png" },
  { id: 6, name: "วิทยาลัยเภสัชกรรมชุมชน", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมชุมชน.png" },
  { id: 7, name: "วิทยาลัยคุ้มครอง", logo: "/assets/Img/sponsors/วิทยาลัยคุ้นครอง 2.png" },
  { id: 8, name: "วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย", logo: "/assets/Img/sponsors/วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย.png" },
  { id: 9, name: "CPPGX", logo: "/assets/Img/sponsors/CPPGX.png" },
];

const mockupSponsors = [
  {
    tier: "Platinum Sponsors",
    sponsors: [
      { id: 101, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
      { id: 102, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
    ]
  },
  {
    tier: "Gold Sponsors",
    sponsors: [
      { id: 103, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
      { id: 104, name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
      { id: 105, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
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
      <section className="relative px-6 md:px-12 pb-12 md:pb-16 pt-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Organized By */}
          <div className="content-block mb-24">
            <div className="flex flex-col items-center text-center mb-10 md:mb-14">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37] pb-4 border-b border-gray-200">
                ORGANIZED BY
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
              {organizedByLogos.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="relative flex items-center justify-center w-40 h-32 md:w-56 md:h-40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="object-contain w-full h-full max-w-[100%] max-h-[100%]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Partner */}
          <div className="content-block mb-24">
            <div className="flex flex-col items-center text-center mb-10 md:mb-14">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37] pb-4 border-b border-gray-200">
                PARTNER
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {partnerLogos.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="relative flex items-center justify-center w-32 h-24 md:w-48 md:h-32"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="object-contain w-full h-full max-w-[90%] max-h-[90%]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mockup Sponsors */}
          <div className="content-block mb-14">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37]">
                SPONSOR
              </h2>
            </div>
            {mockupSponsors.map((tierData, index) => (
              <div key={index} className="mb-14 last:mb-0">
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
              className="bg-gray-900 text-white rounded-full font-bold px-12 md:px-16 py-5 md:py-6 text-center uppercase tracking-widest text-base md:text-lg hover:bg-gray-800 transition-all duration-300"
            >
              {t("cta.btn")}
            </a>
          </div>
        </div>
      </section>


    </main>
  );
}
