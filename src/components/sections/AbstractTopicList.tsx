"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { abstractCategories } from "@/data/abstractData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AbstractTopicList() {
  const containerRef = useRef<HTMLElement>(null);

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
    <section ref={containerRef} className="py-20 md:py-28 bg-slate-50 border-b border-slate-200 overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-12 md:items-start">
          {/* Header Part */}
          <div className="md:w-1/3 md:sticky md:top-32 topic-header">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 font-outfit tracking-tight leading-tight">
              Submission Themes & Topics
            </h2>
            <p className="text-slate-600 leading-relaxed">
              PRIS 2026 welcomes submissions in various fields of pharmaceutical research and innovation. Please select the theme that best fits your research.
            </p>
          </div>

          {/* List Part */}
          <div className="md:w-2/3 topic-list-container">
            <ul className="space-y-6">
              {abstractCategories.map((item) => (
                <li
                  key={item.id}
                  className="topic-item flex gap-6 items-start pb-6 border-b border-slate-200 last:border-0"
                >
                  <div className="w-12 h-12 bg-white border border-slate-300 flex items-center justify-center text-slate-900 shrink-0 font-bold text-lg font-outfit">
                    {item.id.toString().padStart(2, '0')}
                  </div>
                  
                  <div className="pt-1">
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">
                      {item.title}
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
