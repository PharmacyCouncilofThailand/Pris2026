"use client";

import React, { useRef } from "react";

const sponsorsRow = [
  { id: 1, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png", twClass: "scale-[1.2]" },
  { id: 2, name: "Royal College of Pharmacy of Thailand", logo: "/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png", twClass: "scale-[1.25]" },
  { id: 3, name: "Pharmacy Administration College", logo: "/assets/Img/sponsors/วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย.png", twClass: "" },
  { id: 4, name: "Consumer Protection Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยคุ้มครอง.png", twClass: "scale-[1.2]" },
  { id: 5, name: "Community Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมชุมชน.png", twClass: "" },
  { id: 6, name: "Herbal Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย.png", twClass: "" },
  { id: 7, name: "Industrial Pharmacy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชกรรมอุตสาหการแห่งประเทศไทย.png", twClass: "" },
  { id: 8, name: "Pharmacotherapy College", logo: "/assets/Img/sponsors/วิทยาลัยเภสัชบำบัด.png", twClass: "scale-[1.2]" },
  { id: 9, name: "CPPGX", logo: "/assets/Img/sponsors/CPPGX.png", twClass: "scale-[0.85]" },
];

export default function SponsorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRow = [...sponsorsRow, ...sponsorsRow, ...sponsorsRow];

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-black overflow-hidden relative z-10 flex flex-col items-center justify-center min-h-[250px]">

      {/* Center "SPONSORS" watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h2 className="text-[clamp(4rem,10vw,12rem)] font-black uppercase text-white/[0.03] tracking-tighter leading-none select-none">
          SPONSORS
        </h2>
      </div>

      <div className="relative z-20 mb-8 md:mb-12">
        <h3 className="text-white/60 text-sm md:text-base font-medium tracking-[0.5em] uppercase flex items-center justify-center">
          <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-r from-transparent to-white/30 mr-4"></span>
          Our Sponsors
          <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-l from-transparent to-white/30 ml-4"></span>
        </h3>
      </div>

      {/* Marquee container */}
      <div className="relative w-full z-20 overflow-hidden">
        {/* Edge fade masks */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-40 bg-gradient-to-r from-black to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-40 bg-gradient-to-l from-black to-transparent z-30 pointer-events-none" />

        {/* Sponsor logos — GPU-accelerated scroll */}
        <div className="flex w-max animate-sponsor-scroll items-center will-change-transform transform-gpu py-4 md:py-6">
          {marqueeRow.map((sponsor, index) => (
            <div
              key={`r-${sponsor.id}-${index}`}
              className="mx-6 md:mx-10 flex items-center justify-center flex-shrink-0"
            >
              <div className="h-16 w-32 md:h-20 md:w-48 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className={`object-contain max-h-full max-w-full ${sponsor.twClass || ""}`}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sponsor-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .animate-sponsor-scroll {
          animation: sponsor-scroll 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-sponsor-scroll {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}} />
    </section>
  );
}
