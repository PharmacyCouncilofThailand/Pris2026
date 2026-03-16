"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarCheck, CalendarX, Bell, LucideIcon } from "lucide-react";
import { abstractTimeline } from "@/data/abstractData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const iconMap: Record<string, LucideIcon> = {
  green: CalendarCheck,
  red: CalendarX,
  blue: Bell,
};

export default function AbstractTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = containerRef.current?.querySelectorAll(".timeline-card");
      if (!cards) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-black text-[#0a0f1d] mb-6 font-outfit uppercase tracking-tight">
            Important <span className="text-gold">Dates</span>
          </h2>
          <div className="w-20 h-1.5 bg-gold mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          {abstractTimeline.map((item, index) => {
            const IconComponent = iconMap[item.color] || CalendarCheck;
            const isCompleted = item.status === "completed";
            const isActive = item.status === "active";

            return (
              <div
                key={index}
                className="timeline-card group relative p-8 md:p-10 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col items-center text-center bg-white border border-slate-100 h-full"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full ${
                  item.color === 'green' ? 'bg-emerald-500' : 
                  item.color === 'red' ? 'bg-rose-500' : 'bg-blue-500'
                }`} />

                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500 ${
                  item.color === 'green' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 
                  item.color === 'red' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' : 
                  'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
                </div>

                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {item.label}
                </h3>
                
                <p className={`text-2xl md:text-3xl font-black font-outfit ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-[#0a0f1d]'
                }`}>
                  {item.date}
                </p>

                {isActive && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    Pending Deadline
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
