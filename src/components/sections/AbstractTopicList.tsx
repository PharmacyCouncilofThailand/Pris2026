"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2 } from "lucide-react";
import { abstractCategories } from "@/data/abstractData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AbstractTopicList() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = containerRef.current?.querySelectorAll(".topic-item");
      if (!items) return;

      gsap.fromTo(
        items,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-16 md:items-start max-w-6xl mx-auto">
          {/* Header Part */}
          <div className="md:w-1/3">
            <h2 className="text-3xl md:text-5xl font-black text-[#0a0f1d] mb-8 font-outfit uppercase tracking-tighter leading-[0.9]">
              Submission <span className="text-gold">Themes</span> & Topics
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">
              PRIS 2026 welcomes submissions in various fields of pharmaceutical research and innovation. Please select the theme that best fits your research.
            </p>
            <div className="hidden md:block w-32 h-1 bg-gold rounded-full" />
          </div>

          {/* List Part */}
          <div className="md:w-2/3 grid grid-cols-1 gap-4">
            {abstractCategories.map((item) => (
              <div
                key={item.id}
                className="topic-item group flex items-start gap-5 p-6 md:p-8 rounded-2xl bg-white border border-slate-100 hover:border-gold/50 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5 cursor-default relative overflow-hidden"
              >
                {/* Hover Fill */}
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 bg-slate-50 group-hover:bg-gold rounded-2xl flex items-center justify-center text-gold group-hover:text-black transition-all duration-500 shrink-0 font-bold text-xl drop-shadow-sm">
                  {item.id.toString().padStart(2, '0')}
                </div>
                
                <div className="relative z-10 pt-1 md:pt-2">
                  <h3 className="text-lg md:text-xl font-bold text-[#0a0f1d] group-hover:text-blue-900 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Theme</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
