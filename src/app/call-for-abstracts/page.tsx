"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamic imports for the sections we'll build next
// Using ssr: false for GSAP-heavy components
const AbstractTimeline = dynamic(() => import("@/components/sections/AbstractTimeline"), { ssr: false });
const AbstractTopicList = dynamic(() => import("@/components/sections/AbstractTopicList"), { ssr: false });
const AbstractGuidelines = dynamic(() => import("@/components/sections/AbstractGuidelines"), { ssr: false });
const AbstractExamples = dynamic(() => import("@/components/sections/AbstractExamples"), { ssr: false });

export default function CallForAbstractsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* ── Inner Page Header ── */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 border-b border-slate-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <nav className="flex items-center gap-3 mb-8 text-slate-500 text-sm font-semibold uppercase tracking-widest">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">Call for Abstracts</span>
          </nav>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 font-outfit leading-tight tracking-tight">
            Call for <span className="text-blue-600">Abstracts</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl">
            We invite researchers, pharmacists, and health professionals to share their innovative work and research findings with the global community at PRIS 2026.
          </p>
        </div>
      </section>

      {/* ── Content Sections ── */}
      <div>
        <AbstractTimeline />
        <AbstractTopicList />
        <AbstractGuidelines />
        <AbstractExamples />
      </div>

      {/* ── CTA Section ── */}
      <section className="py-24 md:py-32 border-t border-slate-200 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 font-outfit text-slate-900 tracking-tight">
            Ready to Share Your <span className="text-blue-600">Innovation?</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed">
            Join us in shaping the future of pharmacy. Submit your abstract today and be part of the most influential symposium of 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/abstract-submission"
              className="bg-blue-600 text-white font-bold px-8 py-4 text-center uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors"
            >
              Submit Abstract
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
