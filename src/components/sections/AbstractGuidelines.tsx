"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, ListChecks, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { submissionGuidelines, submissionSteps } from "@/data/abstractData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AbstractGuidelines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const elements = containerRef.current?.querySelectorAll(".animate-reveal");
      if (!elements) return;

      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="animate-reveal text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-[#0a0f1d] mb-6 font-outfit uppercase tracking-tight">
            Submission <span className="text-gold">Guidelines</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Please follow these instructions carefully to ensure your abstract is considered for review.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: General Rules */}
          <div className="animate-reveal space-y-10">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 uppercase tracking-wide">General Format</h3>
              </div>
              <ul className="space-y-4">
                {submissionGuidelines.general.map((rule, i) => (
                  <li key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-gold/30 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-gold shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                    <span className="text-slate-700 leading-relaxed font-medium">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-blue-50 border-2 border-dashed border-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 blur-3xl rounded-full" />
              <div className="flex items-start gap-5 relative z-10">
                <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                  <h4 className="text-blue-900 font-bold uppercase tracking-widest text-sm mb-2">Important Note</h4>
                  <p className="text-blue-800/80 leading-relaxed font-semibold">
                    {submissionGuidelines.importantNote}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Submission Steps */}
          <div className="animate-reveal">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                <ListChecks className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 uppercase tracking-wide">Flow Process</h3>
            </div>
            
            <div className="space-y-8 relative">
              {/* Connector Line */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-slate-100 z-0" />

              {submissionSteps.map((item, i) => (
                <div key={i} className="relative z-10 flex items-start gap-6 md:gap-10 group">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-xl md:text-2xl font-black text-[#0a0f1d] group-hover:border-gold group-hover:text-gold transition-all duration-500 shadow-sm shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-2 md:pt-4">
                    <h4 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-gold transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}

              <div className="mt-12 p-6 rounded-2xl bg-gold/5 flex items-center gap-4 border border-gold/10">
                <HelpCircle className="w-5 h-5 text-gold shrink-0" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Need Help? Contact <span className="text-gold">abstract@pris2026.com</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
