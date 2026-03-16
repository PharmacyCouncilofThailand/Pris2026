"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MoveRight } from "lucide-react";
import Link from "next/link";

// Dynamic imports for the sections we'll build next
// Using ssr: false for GSAP-heavy components
const AbstractTimeline = dynamic(() => import("@/components/sections/AbstractTimeline"), { ssr: false });
const AbstractTopicList = dynamic(() => import("@/components/sections/AbstractTopicList"), { ssr: false });
const AbstractGuidelines = dynamic(() => import("@/components/sections/AbstractGuidelines"), { ssr: false });
const AbstractExamples = dynamic(() => import("@/components/sections/AbstractExamples"), { ssr: false });

export default function CallForAbstractsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Inner Page Header ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0a0f1d] overflow-hidden isolate">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold/10 to-transparent pointer-none -z-1" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-900/10 blur-[120px] pointer-none -z-1" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <nav className="flex justify-center items-center gap-3 mb-6 text-gold/80 text-sm font-medium uppercase tracking-[2px]">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <MoveRight className="w-4 h-4" />
              <span className="text-white">Call for Abstracts</span>
            </nav>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 font-outfit leading-tight drop-shadow-sm">
              Call for <span className="text-gold">Abstracts</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              We invite researchers, pharmacists, and health professionals to share their innovative work and research findings with the global community at PRIS 2026.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content Sections ── */}
      <AbstractTimeline />
      
      <div className="bg-slate-50">
        <AbstractTopicList />
      </div>

      <AbstractGuidelines />

      <div className="bg-slate-50">
        <AbstractExamples />
      </div>

      {/* ── CTA Section ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto p-10 md:p-16 rounded-[2rem] bg-[#0a0f1d] text-white relative overflow-hidden shadow-2xl">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 blur-[80px]" />

            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit relative z-10">
              Ready to Share Your <span className="text-gold">Innovation?</span>
            </h2>
            <p className="text-lg text-white/70 mb-10 relative z-10 leading-relaxed">
              Join us in shaping the future of pharmacy. Submit your abstract today and be part of the most influential symposium of 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/abstract-submission"
                className="bg-gold text-black hover:bg-gold/90 font-bold px-10 py-5 rounded-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-wider text-sm shadow-[0_10px_20px_rgba(255,186,0,0.2)]"
              >
                Submit Abstract
              </Link>
              <Link
                href="/abstract-guidelines"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-5 rounded-xl transition-all backdrop-blur-md border border-white/10 uppercase tracking-wider text-sm text-center"
              >
                Full Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
