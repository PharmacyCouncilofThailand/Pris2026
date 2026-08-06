"use client";

import React, { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HighlightVideoSection() {
  const t = useTranslations("highlightVideo");
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });

    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    ).fromTo(
      videoRef.current,
      { opacity: 0, scale: 0.95, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.6"
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative w-full py-24 md:py-40 flex flex-col justify-center items-center bg-black gap-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl flex flex-col items-center z-10">
        {/* Header Text */}
        <div ref={headerRef} className="text-center mb-8 md:mb-16 flex flex-col items-center opacity-0">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6">
            {t('title')}
          </h2>
          <p className="text-base sm:text-lg md:text-2xl text-white/70 max-w-3xl font-light leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Video Layer */}
        <div ref={videoRef} className="relative w-full aspect-video rounded-2xl md:rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(37,99,235,0.15)] group opacity-0">
          <video
            src="https://pub-7078151ee47d4cc6a2666843e2f4cb5d.r2.dev/Pris%20Hero%20Section/Highlight%20PRIS%202025%20-%20Day%201%20-%20สภาเภสัชกรรม%20Pharmacy%20Council%20(720p%2C%20h264).mp4"
            autoPlay
            loop
            muted
            playsInline
            controls
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
