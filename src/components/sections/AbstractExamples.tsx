"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LayoutDashboard, Users, MessageSquare, StickyNote, CornerDownRight } from "lucide-react";
import { abstractExample } from "@/data/abstractData";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AbstractExamples() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const elements = containerRef.current?.querySelectorAll(".animate-reveal");
      if (!elements) return;

      gsap.fromTo(
        elements,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
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
    <section ref={containerRef} className="py-24 md:py-32 overflow-hidden bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="animate-reveal mb-16 md:mb-24 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-[3px] mb-6">
            <span className="w-2 h-2 rounded-full bg-gold" />
            Visual Guide
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0a0f1d] text-center font-outfit uppercase tracking-tight">
            Abstract <span className="text-gold">Structure</span> Example
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Metadata Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="animate-reveal p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-blue-900 uppercase tracking-widest">Metadata</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Title Format</p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed italic">
                    "ALL CAPS, FONT SIZE 14, BOLD"
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Author Linking</p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Step 1: Superscript #</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">Step 2: Underline Presenter</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">Category</p>
                  <p className="text-sm font-bold text-blue-900">Theme 01: Clinical Pharmacy</p>
                </div>
              </div>
            </div>

            <div className="animate-reveal p-8 rounded-3xl bg-[#0a0f1d] text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-3xl rounded-full" />
              <div className="relative z-10">
                <Users className="w-8 h-8 text-gold mb-6" />
                <h4 className="text-xl font-bold font-outfit mb-4">Present with Impact</h4>
                <p className="text-sm text-white/60 leading-relaxed">
                  The presenting author is encouraged to be the first author and must register for the conference.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actual Document Layout (The Paper) */}
          <div className="lg:col-span-8 animate-reveal">
            <div className="relative group">
              {/* Paper Background Shadow */}
              <div className="absolute inset-0 bg-gold/20 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000 -z-1" />
              
              <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-slate-300/50 border border-slate-100 relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-gold" />
                
                {/* Title */}
                <div className="mb-10 text-center">
                  <h4 className="text-lg md:text-xl font-black text-[#0a0f1d] leading-tight mb-6">
                    {abstractExample.title}
                  </h4>
                  
                  {/* Authors */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {abstractExample.authors.map((author, i) => (
                      <span key={i} className={`text-sm md:text-base font-bold text-slate-700 ${author.isPresenter ? 'underline decoration-gold decoration-2 underline-offset-4' : ''}`}>
                        {author.name}<sup>{author.affiliation}</sup>{i < abstractExample.authors.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Affiliations */}
                  <div className="space-y-1">
                    {abstractExample.affiliations.map((aff) => (
                      <p key={aff.id} className="text-[11px] md:text-xs text-slate-400 font-medium italic">
                        <sup>{aff.id}</sup> {aff.name}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Body Sections */}
                <div className="space-y-8">
                  {abstractExample.sections.map((sec, i) => (
                    <div key={i} className="flex gap-4 md:gap-6 group/sec">
                      <div className="w-0.5 h-auto bg-slate-100 group-hover/sec:bg-gold transition-colors shrink-0" />
                      <div>
                        <h5 className="text-[10px] md:text-xs font-black text-gold uppercase tracking-[3px] mb-2">{sec.heading}</h5>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                          {sec.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Keywords */}
                  <div className="pt-6 border-t border-slate-50 flex items-start gap-4">
                    <StickyNote className="w-5 h-5 text-slate-300 shrink-0 mt-1" />
                    <p className="text-sm text-slate-600">
                      <span className="font-black text-[#0a0f1d] uppercase text-[10px] tracking-widest mr-3">Keywords:</span>
                      {abstractExample.keywords.join("; ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
