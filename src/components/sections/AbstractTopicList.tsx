"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { abstractCategories } from "@/data/abstractData";
import { useLocale, useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AbstractTopicList() {
  const containerRef = useRef<HTMLElement>(null);
  const locale = useLocale();
  const tp = useTranslations("abstractPage");

  useGSAP(() => {
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 1024px)", () => {
      // ── Animate Header ──
      gsap.fromTo(".topic-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          force3D: true,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          }
        }
      );

      // ── Animate List Items ──
      const items = gsap.utils.toArray(".topic-item");
      if (items.length > 0) {
        gsap.fromTo(items, 
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: ".topic-list-container",
              start: "top 75%",
            }
          }
        );
      }
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-14 sm:py-16 lg:py-24 bg-slate-50 border-b border-slate-200 overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.45fr)] gap-10 lg:gap-16 xl:gap-20 items-start lg:items-center">
          {/* Header Part */}
          <div className="topic-header max-w-xl lg:max-w-sm">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black text-slate-900 mb-4 tracking-tight leading-[1.04]">
              {tp("topicsTitle")}
            </h2>
            <p className="text-base sm:text-lg lg:text-base text-slate-600 leading-relaxed">
              {tp("topicsDesc")}
            </p>
          </div>

          {/* List Part */}
          <div className="topic-list-container w-full">
            <ul className="divide-y divide-slate-200 border-y border-slate-200">
              {abstractCategories.map((item) => (
                <li
                  key={item.id}
                  className="topic-item group grid grid-cols-[2.75rem_1fr] sm:grid-cols-[3.25rem_1fr] items-start gap-4 sm:gap-6 py-4 sm:py-5 lg:py-6 transition-colors duration-300 hover:bg-white/70"
                >
                  <div className="h-11 w-11 sm:h-12 sm:w-12 bg-white border border-slate-300 flex items-center justify-center text-slate-900 shrink-0 font-bold text-base sm:text-lg transition-colors duration-300 group-hover:border-[#0055FF] group-hover:text-[#0055FF]">
                    {item.id.toString().padStart(2, '0')}
                  </div>
                  
                  <div className="min-w-0 pt-0.5 sm:pt-1">
                    <h3 className="text-lg sm:text-xl lg:text-[1.35rem] font-bold text-slate-900 leading-snug tracking-[-0.01em]">
                      {locale === "th" && item.titleTh ? item.titleTh : item.title}
                    </h3>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
